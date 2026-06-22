import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { TimetableView } from '@/components/TimetableView';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useData } from '@/context/data-context';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';

type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';
type ViewMode = 'list' | 'timetable';

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

function getExhibitorsForEvent(event: Event, exhibitors: Exhibitor[]): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids
    .map((id) => exhibitors.find((e) => e.id === id))
    .filter(Boolean) as Exhibitor[];
}

function matchesSearch(event: Event, query: string, exhibitors: Exhibitor[]): boolean {
  const q = query.toLowerCase();
  if (event.title.toLowerCase().includes(q)) return true;
  return exhibitors.some((ex) => ex.name.toLowerCase().includes(q));
}

export default function EventsScreen() {
  const { events, exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(true);

  const filteredEvents = useMemo(() => {
    let result = [...events].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );
    if (activeCategory !== 'all') result = result.filter((e) => e.category === activeCategory);
    if (activeType !== 'all') result = result.filter((e) => e.activity_type === activeType);
    if (search.trim()) {
      result = result.filter((e) =>
        matchesSearch(e, search.trim(), getExhibitorsForEvent(e, exhibitors)),
      );
    }
    return result;
  }, [events, exhibitors, search, activeCategory, activeType]);

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

  const filterHeader = (
    <View>
      {/* Search bar + view toggle */}
      <View style={styles.searchRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            nativeID="events-search"
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar eventos"
            placeholderTextColor={colors.icon}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
        <Pressable
          style={[styles.filterBtn, { backgroundColor: showFilters ? BACColors.teal : colors.card, borderColor: showFilters ? BACColors.teal : colors.border }]}
          onPress={() => setShowFilters((v) => !v)}>
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

      {/* Category + type filter chips */}
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {viewMode === 'list' ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={filterHeader}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              exhibitors={getExhibitorsForEvent(item, exhibitors)}
              showTemporalLabel={false}
              isSaved={isSaved(item.id)}
              onToggleSave={handleToggleSave}
              dimPast={false}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.icon }]}>
              No hay eventos que coincidan con tu búsqueda.
            </Text>
          }
        />
      ) : (
        <>
          {filterHeader}
          <TimetableView
            events={filteredEvents}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            emptyMessage={
              search.trim() || activeCategory !== 'all' || activeType !== 'all'
                ? 'No hay eventos que coincidan con los filtros activos este día.'
                : 'No hay eventos este día.'
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Search row */
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

  /* Filter button */
  filterBtn: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },

  /* View toggle (segmented control) */
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleBtn: {
    padding: 8,
  },

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
  list: { flex: 1 },
  listContent: { paddingTop: 4, paddingBottom: Platform.select({ web: 32, default: 48 }) },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});
