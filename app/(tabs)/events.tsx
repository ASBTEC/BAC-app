import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EventCard } from '@/components/EventCard';
import { ActivityTypeColors, BACColors, CategoryColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const EVENTS: Event[] = allEvents as Event[];
const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'bioBAC',      label: 'BioBAC' },
  { key: 'businessBAC', label: 'BusinessBAC' },
  { key: 'expoBAC',     label: 'ExpoBAC' },
  { key: 'viveBAC',     label: 'ViveBAC' },
];

const TYPE_FILTERS: { key: FilterType; label: string }[] = [
  { key: 'talk',            label: 'Ponencia' },
  { key: 'round_table',     label: 'Mesa Redonda' },
  { key: 'activity',        label: 'Actividad' },
  { key: 'outdoor_activity', label: 'Al Aire Libre' },
  { key: 'stand',           label: 'Stand' },
];

function getExhibitorsForEvent(event: Event): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids.map((id) => EXHIBITORS.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
}

function matchesSearch(event: Event, query: string, exhibitors: Exhibitor[]): boolean {
  const q = query.toLowerCase();
  if (event.title.toLowerCase().includes(q)) return true;
  return exhibitors.some((ex) => ex.name.toLowerCase().includes(q));
}

export default function EventsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');

  const filteredEvents = useMemo(() => {
    let result = [...EVENTS].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    if (activeCategory !== 'all') {
      result = result.filter((e) => e.category === activeCategory);
    }

    if (activeType !== 'all') {
      result = result.filter((e) => e.activity_type === activeType);
    }

    if (search.trim()) {
      result = result.filter((e) =>
        matchesSearch(e, search.trim(), getExhibitorsForEvent(e)),
      );
    }

    return result;
  }, [search, activeCategory, activeType]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          nativeID="events-search"
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar eventos, ponentes, empresas…"
          placeholderTextColor={colors.icon}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
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

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            exhibitors={getExhibitorsForEvent(item)}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 15,
  },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
});
