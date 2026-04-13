import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EventCard } from '@/components/EventCard';
import { TimetableView } from '@/components/TimetableView';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { Event, Exhibitor } from '@/types';
import { sortByProximity } from '@/utils/temporal';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const EVENTS: Event[] = allEvents as Event[];
const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

type ViewMode = 'list' | 'timetable';

function matchesSearch(event: Event, query: string, exhibitors: Exhibitor[]): boolean {
  const q = query.toLowerCase();
  if (event.title.toLowerCase().includes(q)) return true;
  return exhibitors.some((ex) => ex.name.toLowerCase().includes(q));
}

function getExhibitorsForEvent(event: Event): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids
    .map((id) => EXHIBITORS.find((e) => e.id === id))
    .filter(Boolean) as Exhibitor[];
}

export default function ScheduleScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { savedIds, isSaved, toggleEvent, loaded } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [now, setNow] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const savedEvents = useMemo(() => {
    const saved = EVENTS.filter((e) => {
      if (!savedIds.has(e.id)) return false;
      if (search.trim() && !matchesSearch(e, search.trim(), getExhibitorsForEvent(e))) return false;
      return true;
    });
    return sortByProximity(saved, now);
  }, [savedIds, now, search]);

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

  if (!loaded) return null;

  // Global empty state — no saved events at all
  if (savedEvents.length === 0) {
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

      {/* Search bar + view toggle */}
      <View style={styles.searchRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar eventos guardados…"
            placeholderTextColor={colors.icon}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
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

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          data={savedEvents}
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
        />
      ) : (
        <TimetableView
          events={savedEvents}
          now={now}
          isSaved={isSaved}
          onToggleSave={handleToggleSave}
          emptyMessage="No tienes eventos guardados para este día."
        />
      )}
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
    paddingVertical: 10,
  },
  searchInput: { fontSize: 15 },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toggleBtn: { padding: 8 },

  /* List */
  listContent: { paddingTop: 8, paddingBottom: 32 },

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
