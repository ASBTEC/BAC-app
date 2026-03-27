import type * as NotificationsType from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Event, NotificationLeadTime, NotificationSettings } from '@/types';
import { getItem, setItem } from '@/utils/storage';

const SETTINGS_KEY = 'bac_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  leadTime: 5,
};

// Try to load expo-notifications. If any native module is missing (e.g. Expo Go),
// the require or the setNotificationHandler call will throw and Notif stays null.
// All call sites check `if (!Notif)` so the app runs fine without it.
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

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

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
      if (!Notif) return;
      const triggerMs = new Date(event.start_time).getTime() - leadTime * 60 * 1000;
      if (triggerMs <= Date.now()) return;
      try {
        const identifier = `event_notif_${event.id}`;
        await Notif.cancelScheduledNotificationAsync(identifier).catch(() => {});
        await Notif.scheduleNotificationAsync({
          identifier,
          content: {
            title: event.title,
            body: `Starting in ${leadTime} min · ${event.local_location}`,
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
