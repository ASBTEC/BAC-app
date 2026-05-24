import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { TimetableView } from '@/components/TimetableView';
import { CATEGORY_ICONS } from '@/constants/categoryIcons';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useData } from '@/context/data-context';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';
import { getTemporalStatus } from '@/utils/temporal';

type ViewMode = 'list' | 'timetable';
type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'bioBAC',      label: 'BioBAC' },
  { key: 'businessBAC', label: 'BusinessBAC' },
  { key: 'expoBAC',     label: 'ExpoBAC' },
  { key: 'viveBAC',     label: 'ViveBAC' },
];

const TYPE_FILTERS: { key: FilterType; label: string; iconName: string }[] = [
  { key: 'talk',             label: 'Ponencia',      iconName: 'mic' },
  { key: 'round_table',      label: 'Mesa Redonda',  iconName: 'groups' },
  { key: 'activity',         label: 'Actividad',     iconName: 'extension' },
  { key: 'outdoor_activity', label: 'Al Aire Libre', iconName: 'park' },
  { key: 'stand',            label: 'Stand',         iconName: 'storefront' },
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

const SPACES = [
  { id: 'Auditorium',  label: 'Auditorio',      type: 'classroom' as const, row: 0, col: 0, span: 2 },
  { id: 'Classroom 1', label: 'Aula 1',          type: 'classroom' as const, row: 1, col: 0, span: 1 },
  { id: 'Classroom 2', label: 'Aula 2',          type: 'classroom' as const, row: 1, col: 1, span: 1 },
  { id: 'Laboratory',  label: 'Laboratorio',     type: 'classroom' as const, row: 2, col: 0, span: 1 },
  { id: 'Stand Area',  label: 'Zona de Stands',  type: 'stand'     as const, row: 2, col: 1, span: 1 },
  { id: 'Outdoor',     label: 'Exterior',        type: 'outdoor'   as const, row: 3, col: 0, span: 2 },
];

const SPACE_BG: Record<string, string> = {
  classroom: BACColors.lightBlue,
  stand:     BACColors.amber,
  outdoor:   BACColors.green,
};

function getSpaceEvents(spaceId: string, now: Date, events: Event[]): Event[] {
  return events.filter((e) => {
    if (spaceId === 'Outdoor') {
      if (e.activity_type !== 'outdoor_activity') return false;
    } else {
      if (e.activity_type === 'stand') return false;
      if (e.local_location !== spaceId && !e.local_location.includes(spaceId)) return false;
    }
    const s = getTemporalStatus(e, now);
    return s === 'now' || s === 'upcoming' || s === 'future';
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

const INDOOR_SPACES = SPACES.filter((s) => s.type !== 'outdoor');
const OUTDOOR_SPACES = SPACES.filter((s) => s.type === 'outdoor');

const ROWS = INDOOR_SPACES.reduce<(typeof SPACES[number])[][]>((acc, s) => {
  if (!acc[s.row]) acc[s.row] = [];
  acc[s.row].push(s);
  return acc;
}, []);

export default function MapScreen() {
  const { events, exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [now] = useState(new Date());
  const { space } = useLocalSearchParams<{ space?: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');

  useEffect(() => {
    if (space) setSelectedSpace(space);
  }, [space]);

  const spaceEvents = useMemo<Event[]>(
    () => (selectedSpace ? getSpaceEvents(selectedSpace, now, events) : []),
    [selectedSpace, now, events],
  );

  const filteredEvents = useMemo(() => {
    return spaceEvents.filter((e) => {
      if (activeCategory !== 'all' && e.category !== activeCategory) return false;
      if (activeType !== 'all' && e.activity_type !== activeType) return false;
      if (search.trim() && !matchesSearch(e, search.trim(), getExhibitorsForEvent(e, exhibitors))) return false;
      return true;
    });
  }, [spaceEvents, exhibitors, activeCategory, activeType, search]);

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
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>
      {/* Map area */}
      <View style={styles.mapArea}>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Toca un espacio para ver sus eventos
        </Text>

        {/* Indoor building */}
        <View style={[styles.building, { borderColor: BACColors.navyDark, backgroundColor: scheme === 'dark' ? '#1E2427' : '#F0F4F8' }]}>
          <Text style={[styles.buildingLabel, { color: BACColors.navyDark }]}>
            FACULTAD DE BIOCIENCIAS — UAB
          </Text>
          {ROWS.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((space) => {
                const selected = selectedSpace === space.id;
                const bg = selected ? BACColors.teal : SPACE_BG[space.type];
                return (
                  <Pressable
                    key={space.id}
                    style={[
                      styles.spaceBtn,
                      { flex: space.span, backgroundColor: bg, borderColor: selected ? BACColors.navyDark : BACColors.navyDark + '44', borderWidth: selected ? 2 : 1.5 },
                    ]}
                    onPress={() => setSelectedSpace(space.id === selectedSpace ? null : space.id)}>
                    <Text style={[styles.spaceLabel, { color: selected ? '#fff' : BACColors.navyDark }]}>
                      {space.label}
                    </Text>
                    <Text style={[styles.spaceType, { color: selected ? '#ffffffcc' : BACColors.navyDark + 'aa' }]}>
                      {space.type === 'classroom' ? 'Aula' : 'Zona de Stands'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Outdoor panel — separate from the building */}
        <View style={[styles.outdoorPanel, { borderColor: BACColors.green + '88', backgroundColor: scheme === 'dark' ? '#1E2427' : '#F4FBF4' }]}>
          <Text style={[styles.buildingLabel, { color: BACColors.green }]}>
            EXTERIOR DE LA FACULTAD DE BIOCIENCIAS
          </Text>
          <View style={styles.row}>
            {OUTDOOR_SPACES.map((space) => {
              const selected = selectedSpace === space.id;
              const bg = selected ? BACColors.teal : SPACE_BG[space.type];
              return (
                <Pressable
                  key={space.id}
                  style={[
                    styles.spaceBtn,
                    { flex: space.span, backgroundColor: bg, borderColor: selected ? BACColors.navyDark : BACColors.green + '66', borderWidth: selected ? 2 : 1.5 },
                  ]}
                  onPress={() => setSelectedSpace(space.id === selectedSpace ? null : space.id)}>
                  <Text style={[styles.spaceLabel, { color: selected ? '#fff' : BACColors.navyDark }]}>
                    {space.label}
                  </Text>
                  <Text style={[styles.spaceType, { color: selected ? '#ffffffcc' : BACColors.navyDark + 'aa' }]}>
                    Zona exterior
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.lightBlue }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Aula / Auditorio</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.amber }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Zona de Stands</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.green }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Exterior</Text>
          </View>
        </View>
      </View>

      {/* Event list — shown below the map when a space is selected */}
      {selectedSpace && (
        <View style={[styles.eventPanel, { borderTopColor: colors.border }]}>

          {/* Space name header */}
          <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {SPACES.find((s) => s.id === selectedSpace)?.label ?? selectedSpace}
            </Text>
          </View>

          {/* Search bar + filter button + view toggle */}
          <View style={styles.searchRow}>
            <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar eventos en mapa"
                placeholderTextColor={colors.icon}
                value={search}
                onChangeText={setSearch}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </View>
            <Pressable
              style={[
                styles.filterBtn,
                { backgroundColor: showFilters ? BACColors.teal : colors.card, borderColor: showFilters ? BACColors.teal : colors.border },
              ]}
              onPress={() => setShowFilters((v) => !v)}>
              <MaterialIcons name="filter-alt" size={18} color={showFilters ? '#fff' : colors.icon} />
            </Pressable>
            <View style={[styles.viewToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: BACColors.teal }]}
                onPress={() => setViewMode('list')}>
                <MaterialIcons name="view-list" size={18} color={viewMode === 'list' ? '#fff' : colors.icon} />
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'timetable' && { backgroundColor: BACColors.teal }]}
                onPress={() => setViewMode('timetable')}>
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
                    <Pressable
                      key={key}
                      style={[
                        styles.filterChip,
                        { backgroundColor: active ? BACColors.teal : colors.card, borderColor: active ? BACColors.teal : colors.border },
                      ]}
                      onPress={() => setActiveCategory(active ? 'all' : key)}>
                      {Icon && <Icon width={18} height={18} color={active ? '#fff' : colors.text} />}
                      <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.filterDivider} />

              <View style={styles.filterRow}>
                {TYPE_FILTERS.map(({ key, label, iconName }) => {
                  const active = activeType === key;
                  return (
                    <Pressable
                      key={key}
                      style={[
                        styles.filterChip,
                        { backgroundColor: active ? BACColors.teal : colors.card, borderColor: active ? BACColors.teal : colors.border },
                      ]}
                      onPress={() => setActiveType(active ? 'all' : key)}>
                      <MaterialIcons name={iconName as any} size={14} color={active ? '#fff' : colors.text} />
                      <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Events */}
          {viewMode === 'list' ? (
            <View style={styles.listContent}>
              {filteredEvents.length === 0 ? (
                <Text style={[styles.empty, { color: colors.icon }]}>
                  No hay eventos actuales ni próximos en este espacio.
                </Text>
              ) : (
                filteredEvents.map((item) => (
                  <EventCard
                    key={item.id}
                    event={item}
                    exhibitors={getExhibitorsForEvent(item, exhibitors)}
                    showTemporalLabel
                    isSaved={isSaved(item.id)}
                    onToggleSave={handleToggleSave}
                    now={now}
                    dimPast={false}
                  />
                ))
              )}
            </View>
          ) : (
            <TimetableView
              events={filteredEvents}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              emptyMessage="No hay eventos que coincidan con los filtros activos este día."
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  mapArea: { alignItems: 'center', paddingBottom: 12 },
  subtitle: { fontSize: 12, marginTop: 12, marginBottom: 12, textAlign: 'center', paddingHorizontal: 16 },
  building: {
    width: 300,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  outdoorPanel: {
    width: 300,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginTop: 10,
  },
  buildingLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 8 },
  spaceBtn: {
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  spaceLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  spaceType: { fontSize: 10, textAlign: 'center' },
  legend: { flexDirection: 'row', gap: 20, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12 },

  /* Event panel */
  eventPanel: { borderTopWidth: 1 },
  panelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  panelTitle: { fontSize: 14, fontFamily: OrbitronFonts.bold },

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
  listContent: { paddingVertical: 8, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, paddingHorizontal: 24 },
});
