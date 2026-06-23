import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { EventCard } from '@/components/EventCard';
import { FilterDropdown } from '@/components/FilterDropdown';
import { TimetableView } from '@/components/TimetableView';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useData } from '@/context/data-context';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';
import { sortByProximity } from '@/utils/temporal';

type ViewMode = 'list' | 'timetable';
type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';

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

function matchesSearch(event: Event, query: string, exhibitors: Exhibitor[]): boolean {
  const q = query.toLowerCase();
  if (event.title.toLowerCase().includes(q)) return true;
  return exhibitors.some((ex) => ex.name.toLowerCase().includes(q));
}

function getExhibitorsForEvent(event: Event, exhibitors: Exhibitor[]): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids
    .map((id) => exhibitors.find((e) => e.id === id))
    .filter(Boolean) as Exhibitor[];
}

export default function ScheduleScreen() {
  const { events, exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { savedIds, isSaved, toggleEvent, loaded } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [now, setNow] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('timetable');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const savedEvents = useMemo(() => {
    const saved = events.filter((e) => {
      if (!savedIds.has(e.id)) return false;
      if (activeCategory !== 'all' && e.category !== activeCategory) return false;
      if (activeType !== 'all' && e.activity_type !== activeType) return false;
      if (search.trim() && !matchesSearch(e, search.trim(), getExhibitorsForEvent(e, exhibitors))) return false;
      return true;
    });
    return sortByProximity(saved, now);
  }, [events, exhibitors, savedIds, now, search, activeCategory, activeType]);

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

  if (!loaded) return null;

  // Global empty state — no saved events at all (not just filtered out)
  if (savedIds.size === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Aún no tienes eventos guardados
        </Text>
        <Text style={[styles.emptySub, { color: colors.icon }]}>
          Explora los eventos y pulsa el marcador para guardarlos aquí.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {(() => {
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
                <CategoryDropdown
                  value={activeCategory}
                  options={CATEGORY_FILTERS}
                  onChange={setActiveCategory}
                />
                <View style={styles.filterDivider} />
                <FilterDropdown
                  value={activeType}
                  options={TYPE_FILTERS}
                  onChange={setActiveType}
                  allLabel="Todos los tipos"
                />
              </>
            )}
          </View>
        );

        return viewMode === 'list' ? (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            data={savedEvents}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={filterHeader}
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
              <Text style={[styles.empty, { color: colors.icon }]}>
                No hay eventos guardados que coincidan con los filtros.
              </Text>
            }
          />
        ) : (
          <TimetableView
            events={savedEvents}
            now={now}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            header={filterHeader}
            emptyMessage="No tienes eventos guardados para este día."
          />
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  /* Search row */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
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

  /* Filter chips */
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

  /* List */
  listContent: { paddingTop: 8, paddingBottom: Platform.select({ web: 32, default: 48 }) },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14, paddingHorizontal: 24 },

  /* Global empty state */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: OrbitronFonts.bold,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
