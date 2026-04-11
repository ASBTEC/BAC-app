import React, { useCallback, useMemo, useState } from 'react';
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
import { getTemporalStatus } from '@/utils/temporal';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const EVENTS: Event[] = allEvents as Event[];
const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

function getExhibitorsForEvent(event: Event): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids
    .map((id) => EXHIBITORS.find((e) => e.id === id))
    .filter(Boolean) as Exhibitor[];
}

const SPACES = [
  { id: 'Auditorium',  label: 'Auditorium',  type: 'classroom' as const, row: 0, col: 0, span: 2 },
  { id: 'Classroom 1', label: 'Classroom 1', type: 'classroom' as const, row: 1, col: 0, span: 1 },
  { id: 'Classroom 2', label: 'Classroom 2', type: 'classroom' as const, row: 1, col: 1, span: 1 },
  { id: 'Laboratory',  label: 'Laboratory',  type: 'classroom' as const, row: 2, col: 0, span: 1 },
  { id: 'Stand Area',  label: 'Stand Area',  type: 'stand'     as const, row: 2, col: 1, span: 1 },
];

const SPACE_BG: Record<string, string> = {
  classroom: BACColors.lightBlue,
  stand: BACColors.amber,
};

function getSpaceEvents(spaceId: string, now: Date): Event[] {
  return EVENTS.filter((e) => {
    if (e.activity_type === 'stand') return false;
    if (e.local_location !== spaceId && !e.local_location.includes(spaceId)) return false;
    const s = getTemporalStatus(e, now);
    return s === 'now' || s === 'upcoming' || s === 'future';
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

const ROWS = SPACES.reduce<(typeof SPACES[number])[][]>((acc, s) => {
  if (!acc[s.row]) acc[s.row] = [];
  acc[s.row].push(s);
  return acc;
}, []);

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [now] = useState(new Date());

  const spaceEvents = useMemo<Event[]>(
    () => (selectedSpace ? getSpaceEvents(selectedSpace, now) : []),
    [selectedSpace, now],
  );

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
      {/* Map area */}
      <View style={styles.mapArea}>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Faculty of Biosciences · UAB · Tap a space to see its events
        </Text>

        <View style={[styles.building, { borderColor: BACColors.navyDark, backgroundColor: scheme === 'dark' ? '#1E2427' : '#F0F4F8' }]}>
          <Text style={[styles.buildingLabel, { color: BACColors.navyDark }]}>
            FACULTY OF BIOSCIENCES — UAB
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
                      {space.type === 'classroom' ? 'Classroom' : 'Stand Zone'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.lightBlue }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Classroom / Auditorium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.amber }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Stand Area</Text>
          </View>
        </View>
      </View>

      {/* Event list — shown below the map when a space is selected */}
      {selectedSpace && (
        <View style={[styles.eventPanel, { borderTopColor: colors.border }]}>
          <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>{selectedSpace}</Text>
          </View>
          <FlatList
            data={spaceEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <EventCard
                event={item}
                exhibitors={getExhibitorsForEvent(item)}
                showTemporalLabel
                isSaved={isSaved(item.id)}
                onToggleSave={handleToggleSave}
                now={now}
                dimPast={false}
              />
            )}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.icon }]}>
                No current or upcoming events in this space.
              </Text>
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapArea: { alignItems: 'center', paddingBottom: 12 },
  subtitle: { fontSize: 12, marginTop: 12, marginBottom: 12, textAlign: 'center', paddingHorizontal: 16 },
  building: {
    width: 300,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    gap: 8,
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
  eventPanel: { flex: 1, borderTopWidth: 1 },
  panelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  panelTitle: { fontSize: 16, fontWeight: '700' },
  listContent: { paddingVertical: 8, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, paddingHorizontal: 24 },
});
