import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { Event, Exhibitor } from '@/types';
import { getTemporalStatus } from '@/utils/temporal';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const MAPS_URL = 'https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8';

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

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sections = useMemo(() => {
    const nonStand = EVENTS.filter((e) => e.activity_type !== 'stand');

    const current: Event[] = [];
    const upcoming: Event[] = [];
    const past: Event[] = [];

    for (const event of nonStand) {
      const status = getTemporalStatus(event, now);
      if (status === 'now') {
        current.push(event);
      } else if (status === 'past') {
        past.push(event);
      } else {
        // 'upcoming' (≤30 min) and 'future' both go to upcoming section
        upcoming.push(event);
      }
    }

    const byStart = (a: Event, b: Event) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime();

    current.sort(byStart);
    upcoming.sort(byStart);
    past.sort((a, b) => byStart(b, a)); // most recent first

    const result = [];
    if (current.length > 0) result.push({ title: 'Eventos en curso', data: current });
    if (upcoming.length > 0) result.push({ title: 'Próximos eventos', data: upcoming });
    if (past.length > 0) result.push({ title: 'Eventos pasados', data: past });
    return result;
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

  return (
    <SectionList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={[styles.header, { backgroundColor: BACColors.navyDark }]}>
          <Text style={styles.congressTitle}>Congreso Anual de Biotecnología</Text>
          <Text style={styles.congressYear}>BAC 2026</Text>

          <Pressable onPress={() => Linking.openURL(MAPS_URL)} style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={BACColors.lightBlue} />
            <Text style={styles.locationText}>UAB, Barcelona</Text>
          </Pressable>

          <Pressable onPress={() => Linking.openURL(GCAL_URL)} style={styles.datePill}>
            <MaterialIcons name="calendar-today" size={14} color={BACColors.navyDark} />
            <Text style={styles.dateText}>7 – 11 de julio de 2026</Text>
          </Pressable>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>{section.title}</Text>
        </View>
      )}
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
        <Text style={[styles.empty, { color: colors.icon }]}>No se han encontrado eventos.</Text>
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
    fontFamily: OrbitronFonts.regular,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  congressYear: {
    color: '#fff',
    fontSize: 32,
    fontFamily: OrbitronFonts.black,
    lineHeight: 40,
    marginTop: 4,
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
  },
  dateText: {
    color: BACColors.navyDark,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: OrbitronFonts.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
