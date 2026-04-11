import type * as NotificationsType from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Event, NotificationLeadTime, NotificationSettings } from '@/types';
import { getItem, setItem } from '@/utils/storage';

const SETTINGS_KEY = 'bac_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  leadTime: 5,
};

// Load expo-notifications only on native — it has no web implementation.
let Notif: typeof NotificationsType | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notif = require('expo-notifications');
    Notif!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    Notif = null;
  }
}

// ─── Web helpers ─────────────────────────────────────────────────────────────

async function requestWebPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  // Web: map eventId → setTimeout handle so we can cancel later
  const webTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          setSettings(JSON.parse(raw));
        } catch {
          // ignore corrupt storage
        }
      }
    });
  }, []);

  const persistSettings = useCallback((next: NotificationSettings) => {
    setItem(SETTINGS_KEY, JSON.stringify(next));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return requestWebPermission();
    if (!Notif) return false;
    try {
      const { status } = await Notif.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<NotificationSettings>) => {
      const next = { ...settings, ...patch };
      if (next.enabled) {
        const granted = await requestPermission();
        if (!granted) next.enabled = false;
      }
      setSettings(next);
      persistSettings(next);
      return next;
    },
    [settings, persistSettings, requestPermission],
  );

  const scheduleEventNotification = useCallback(
    async (event: Event, leadTime: NotificationLeadTime) => {
      const triggerMs = new Date(event.start_time).getTime() - leadTime * 60 * 1000;

      if (Platform.OS === 'web') {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        const delay = triggerMs - Date.now();
        if (delay <= 0) return;

        // Cancel any existing timer for this event first
        const existing = webTimers.current.get(event.id);
        if (existing !== undefined) clearTimeout(existing);

        const timerId = setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(event.title, {
              body: `Comienza en ${leadTime} min · ${event.local_location}`,
            });
          }
          webTimers.current.delete(event.id);
        }, delay);

        webTimers.current.set(event.id, timerId);
        return;
      }

      if (!Notif) return;
      if (triggerMs <= Date.now()) return;
      try {
        const identifier = `event_notif_${event.id}`;
        await Notif.cancelScheduledNotificationAsync(identifier).catch(() => {});
        await Notif.scheduleNotificationAsync({
          identifier,
          content: {
            title: event.title,
            body: `Comienza en ${leadTime} min · ${event.local_location}`,
            data: { eventId: event.id },
          },
          trigger: {
            type: Notif.SchedulableTriggerInputTypes.DATE,
            date: new Date(triggerMs),
          },
        });
      } catch {
        // ignore scheduling failures
      }
    },
    [],
  );

  const cancelEventNotification = useCallback(async (eventId: string) => {
    if (Platform.OS === 'web') {
      const timerId = webTimers.current.get(eventId);
      if (timerId !== undefined) {
        clearTimeout(timerId);
        webTimers.current.delete(eventId);
      }
      return;
    }

    if (!Notif) return;
    try {
      await Notif.cancelScheduledNotificationAsync(`event_notif_${eventId}`);
    } catch {
      // ignore
    }
  }, []);

  return {
    settings,
    updateSettings,
    scheduleEventNotification,
    cancelEventNotification,
  };
}
