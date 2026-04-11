import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { GlobalMenu } from '@/components/GlobalMenu';
import { ActivityTypeColors, BACColors, CategoryColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';
import { getTemporalStatus } from '@/utils/temporal';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'bioBAC',      label: 'BioBAC' },
  { key: 'businessBAC', label: 'BusinessBAC' },
  { key: 'expoBAC',     label: 'ExpoBAC' },
  { key: 'viveBAC',     label: 'ViveBAC' },
];

const TYPE_FILTERS: { key: FilterType; label: string }[] = [
  { key: 'talk',             label: 'Ponencia' },
  { key: 'round_table',      label: 'Mesa Redonda' },
  { key: 'activity',         label: 'Actividad' },
  { key: 'outdoor_activity', label: 'Al Aire Libre' },
  { key: 'stand',            label: 'Stand' },
];

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
  const { width: screenWidth } = useWindowDimensions();
  const logoWidth = Math.min(screenWidth * 0.22, 110);
  const logoHeight = logoWidth * (130 / 110);
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, updateSettings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [now, setNow] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sections = useMemo(() => {
    const nonStand = EVENTS.filter((e) => {
      if (e.activity_type === 'stand') return false;
      if (activeCategory !== 'all' && e.category !== activeCategory) return false;
      if (activeType !== 'all' && e.activity_type !== activeType) return false;
      return true;
    });

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
  }, [now, activeCategory, activeType]);

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
    <>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero header */}
      <View style={[styles.header, { backgroundColor: BACColors.navyDark }]}>
        <Pressable hitSlop={12} onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
          <MaterialIcons name="more-vert" size={24} color="#fff" />
        </Pressable>
        <View style={styles.heroRow}>
          <Image
            source={require('@/assets/images/logo-in-app.png')}
            style={[styles.logo, { width: logoWidth, height: logoHeight }]}
            resizeMode="contain"
          />
          <View style={styles.heroContent}>
            <Text style={styles.congressTitle}>Congreso Anual de Biotecnología</Text>
            <Text style={styles.congressYear}>BAC Barcelona 2026</Text>

            <Pressable onPress={() => Platform.OS === 'web' ? window.open(MAPS_URL, '_blank') : Linking.openURL(MAPS_URL)} style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={BACColors.lightBlue} />
              <Text style={styles.locationText}>Facultad de Biociencias UAB, Barcelona</Text>
            </Pressable>

            <Pressable onPress={() => Platform.OS === 'web' ? window.open(GCAL_URL, '_blank') : Linking.openURL(GCAL_URL)} style={styles.datePill}>
              <MaterialIcons name="calendar-today" size={14} color={BACColors.navyDark} />
              <Text style={styles.dateText}>7 – 11 de julio de 2026</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {CATEGORY_FILTERS.map(({ key, label }) => {
          const active = activeCategory === key;
          const accent = CategoryColors[key] ?? BACColors.teal;
          return (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? accent : colors.card,
                  borderColor: active ? accent : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(active ? 'all' : key)}>
              <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Activity type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {TYPE_FILTERS.map(({ key, label }) => {
          const active = activeType === key;
          const accent = ActivityTypeColors[key] ?? BACColors.navyMid;
          return (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? accent : colors.card,
                  borderColor: active ? accent : colors.border,
                },
              ]}
              onPress={() => setActiveType(active ? 'all' : key)}>
              <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionList
        style={styles.list}
        contentContainerStyle={styles.content}
        sections={sections}
        keyExtractor={(item) => item.id}
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
    </View>

    <GlobalMenu
      visible={menuOpen}
      onClose={() => setMenuOpen(false)}
      notificationSettings={settings}
      onUpdateNotifications={updateSettings}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  content: { paddingBottom: 32 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 6, gap: 8, alignItems: 'center' },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroContent: {
    flex: 1,
  },
  logo: {},
  menuBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 1,
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
