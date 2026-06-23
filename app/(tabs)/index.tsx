import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { GlobalMenu } from '@/components/GlobalMenu';
import { TimetableView } from '@/components/TimetableView';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useData } from '@/context/data-context';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';
import { getTemporalStatus } from '@/utils/temporal';

type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';
type ViewMode = 'list' | 'timetable';

function matchesSearch(event: Event, query: string, exhibitors: Exhibitor[]): boolean {
  const q = query.toLowerCase();
  if (event.title.toLowerCase().includes(q)) return true;
  return exhibitors.some((ex) => ex.name.toLowerCase().includes(q));
}

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'bioBAC',      label: 'BioBAC' },
  { key: 'businessBAC', label: 'BusinessBAC' },
  { key: 'expoBAC',     label: 'ExpoBAC' },
  { key: 'general',     label: 'General' },
  { key: 'viveBAC',     label: 'ViveBAC' },
];

const TYPE_FILTERS: { key: FilterType; label: string; iconName: string }[] = [
  { key: 'Ponencia',                label: 'Ponencia',                iconName: 'mic' },
  { key: 'Presentación flash',      label: 'Presentación flash',      iconName: 'mic' },
  { key: 'Acto institucional',      label: 'Acto institucional',      iconName: 'mic' },
  { key: 'Mesa redonda',            label: 'Mesa redonda',            iconName: 'groups' },
  { key: 'Debate',                  label: 'Debate',                  iconName: 'groups' },
  { key: 'Stand',                   label: 'Stand',                   iconName: 'storefront' },
  { key: 'Curso',                   label: 'Curso',                   iconName: 'school' },
  { key: 'Taller',                  label: 'Taller',                  iconName: 'build' },
  { key: 'Comidas y coffee breaks', label: 'Comidas y coffee breaks', iconName: 'restaurant' },
  { key: 'Presentación de poster',  label: 'Presentación de poster',  iconName: 'article' },
  { key: 'Speed Meeting',           label: 'Speed Meeting',           iconName: 'speed' },
  { key: 'Visita',                  label: 'Visita',                  iconName: 'park' },
];

const MAPS_URL = 'https://maps.app.goo.gl/hZKM9e8Mg6i52DPA8';

const GCAL_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=BAC+2026+%E2%80%94+Biotechnology+Annual+Congress' +
  '&dates=20260707%2F20260712' +
  '&location=Faculty+of+Biosciences%2C+UAB%2C+Barcelona' +
  '&details=https%3A%2F%2Fmaps.app.goo.gl%2FhZKM9e8Mg6i52DPA8';

function getExhibitorsForEvent(event: Event, exhibitors: Exhibitor[]): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids.map((id) => exhibitors.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
}

export default function HomeScreen() {
  const { events, exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { width: screenWidth } = useWindowDimensions();
  const { top: topInset } = useSafeAreaInsets();
  const logoWidth = Math.min(screenWidth * 0.22, 110);
  const logoHeight = logoWidth * (130 / 110);
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, updateSettings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [now, setNow] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sections = useMemo(() => {
    const nonStand = events.filter((e) => {
      if (activeCategory !== 'all' && e.category !== activeCategory) return false;
      if (activeType !== 'all' && e.activity_type !== activeType) return false;
      if (search.trim() && !matchesSearch(e, search.trim(), getExhibitorsForEvent(e, exhibitors))) return false;
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
  }, [events, exhibitors, now, activeCategory, activeType, search]);

  const filteredEvents = useMemo(
    () => sections.flatMap((s) => s.data),
    [sections],
  );

  const handleToggleSave = useCallback(
    (id: string) => {
      const event = events.find((e) => e.id === id);
      if (!event) return;
      const willSave = !isSaved(id);
      toggleEvent(id);
      if (willSave && settings.enabled) {
        scheduleEventNotification(event, settings.leadTime);
      } else {
        cancelEventNotification(id);
      }
    },
    [events, isSaved, toggleEvent, settings, scheduleEventNotification, cancelEventNotification],
  );

  return (
    <>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {(() => {
        const heroHeader = (
          <View style={[styles.header, { backgroundColor: BACColors.navyDark, paddingTop: topInset + 16 }]}>
            <Pressable hitSlop={12} onPress={() => setMenuOpen(true)} style={[styles.menuBtn, { top: topInset + 12 }]}>
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
        );

        const filterHeader = (
          <View>
            <View style={styles.searchRow}>
              <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Buscar eventos"
                  placeholderTextColor={colors.icon}
                  value={search}
                  onChangeText={setSearch}
                  clearButtonMode="while-editing"
                  returnKeyType="search"
                />
              </View>
              <Pressable style={[styles.filterBtn, { backgroundColor: showFilters ? BACColors.teal : colors.card, borderColor: showFilters ? BACColors.teal : colors.border }]} onPress={() => setShowFilters((v) => !v)}>
                <MaterialIcons name="filter-alt" size={18} color={showFilters ? '#fff' : colors.icon} />
              </Pressable>
              <View style={[styles.viewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: BACColors.teal }]} onPress={() => setViewMode('list')}>
                  <MaterialIcons name="view-list" size={18} color={viewMode === 'list' ? '#fff' : colors.icon} />
                </Pressable>
                <Pressable style={[styles.toggleBtn, viewMode === 'timetable' && { backgroundColor: BACColors.teal }]} onPress={() => setViewMode('timetable')}>
                  <MaterialIcons name="view-week" size={18} color={viewMode === 'timetable' ? '#fff' : colors.icon} />
                </Pressable>
              </View>
            </View>
            {showFilters && (
              <>
                <View style={styles.filterRow}>
                  {CATEGORY_FILTERS.map(({ key, label }) => {
                    const active = activeCategory === key;
                    const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
                    return (
                      <Pressable key={key} style={[styles.filterChip, { backgroundColor: active ? BACColors.teal : colors.card, borderColor: active ? BACColors.teal : colors.border }]} onPress={() => setActiveCategory(active ? 'all' : key)}>
                        {Icon && <Icon width={18} height={18} color={active ? '#fff' : colors.text} />}
                        <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.filterDivider} />
                <View style={styles.filterRow}>
                  {TYPE_FILTERS.map(({ key, label, iconName }) => {
                    const active = activeType === key;
                    return (
                      <Pressable key={key} style={[styles.filterChip, { backgroundColor: active ? BACColors.teal : colors.card, borderColor: active ? BACColors.teal : colors.border }]} onPress={() => setActiveType(active ? 'all' : key)}>
                        <MaterialIcons name={iconName as any} size={14} color={active ? '#fff' : colors.text} />
                        <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        );

        return viewMode === 'list' ? (
          <SectionList
            style={styles.list}
            contentContainerStyle={styles.content}
            sections={sections}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={<>{heroHeader}{filterHeader}</>}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                exhibitors={getExhibitorsForEvent(item, exhibitors)}
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
        ) : (
          <TimetableView
            events={filteredEvents}
            now={now}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            header={<>{heroHeader}{filterHeader}</>}
            emptyMessage={
              search.trim() || activeCategory !== 'all' || activeType !== 'all'
                ? 'No hay eventos que coincidan con los filtros activos este día.'
                : 'No hay eventos este día.'
            }
          />
        );
      })()}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  searchWrap: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    height: 44,
  },
  searchInput: { fontSize: 15, textAlignVertical: 'center', paddingVertical: 0 },
  filterBtn: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleBtn: { padding: 8 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 8,
  },
  filterDivider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: BACColors.lightBlue,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
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
