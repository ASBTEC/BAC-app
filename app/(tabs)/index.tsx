import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { Event, Exhibitor } from '@/types';
import { sortByProximity } from '@/utils/temporal';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const MAPS_URL = 'https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8';

// Google Calendar URL for adding the congress as an all-day event (20260707–20260712 = excl. end)
const GCAL_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=BAC+2026+%E2%80%94+Biotechnology+Annual+Congress' +
  '&dates=20260707%2F20260712' +
  '&location=Faculty+of+Biosciences%2C+UAB%2C+Barcelona' +
  '&details=https%3A%2F%2Fmaps.app.goo.gl%2FhZKM9e8Mg6i52DPA8';

const EVENTS: Event[] = allEvents as Event[];
const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

function getExhibitorsForEvent(event: Event): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids.map((id) => EXHIBITORS.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [now, setNow] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refresh temporal status every minute
  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Home shows all non-stand events sorted by time proximity
  const visibleEvents = useMemo(() => {
    const nonStand = EVENTS.filter((e) => e.activity_type !== 'stand');
    return sortByProximity(nonStand, now);
  }, [now]);

  const handleToggleSave = useCallback(
    (id: string) => {
      const event = EVENTS.find((e) => e.id === id);
      if (!event) return;
      const willSave = !isSaved(id);
      toggleEvent(id);
      if (willSave && settings.enabled) {
        scheduleEventNotification(event, settings.leadTime);
      } else {
        cancelEventNotification(id);
      }
    },
    [isSaved, toggleEvent, settings, scheduleEventNotification, cancelEventNotification],
  );

  const openMaps = () => Linking.openURL(MAPS_URL);

  const addToCalendar = () => Linking.openURL(GCAL_URL);

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={[styles.header, { backgroundColor: BACColors.navyDark }]}>
          <Text style={styles.congressTitle}>Biotechnology Annual Congress</Text>
          <Text style={styles.congressYear}>BAC 2026</Text>

          <Pressable onPress={openMaps} style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={BACColors.lightBlue} />
            <Text style={styles.locationText}>UAB Barcelona</Text>
          </Pressable>

          <Pressable onPress={addToCalendar} style={styles.datePill}>
            <MaterialIcons name="calendar-today" size={14} color={BACColors.navyDark} />
            <Text style={styles.dateText}>7 – 11 July 2026</Text>
          </Pressable>

          <Text style={[styles.sectionLabel, { color: BACColors.lightBlue }]}>Current & Upcoming Events</Text>
        </View>
      }
      data={visibleEvents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard
          event={item}
          exhibitors={getExhibitorsForEvent(item)}
          showTemporalLabel
          isSaved={isSaved(item.id)}
          onToggleSave={handleToggleSave}
          now={now}
          dimPast
        />
      )}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.icon }]}>No events found.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: 8,
  },
  congressTitle: {
    color: BACColors.lightBlue,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  congressYear: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
    marginTop: 2,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    color: BACColors.lightBlue,
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: BACColors.amber,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  dateText: {
    color: BACColors.navyDark,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
