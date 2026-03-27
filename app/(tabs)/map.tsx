import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
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

interface SpaceEvents { now: Event[]; upcoming: Event[] }

function getSpaceEvents(spaceId: string, now: Date): SpaceEvents {
  const relevant = EVENTS.filter((e) => {
    if (e.activity_type === 'stand') return false;
    if (e.local_location !== spaceId && !e.local_location.includes(spaceId)) return false;
    const s = getTemporalStatus(e, now);
    return s === 'now' || s === 'upcoming' || s === 'future';
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  return {
    now: relevant.filter((e) => getTemporalStatus(e, now) === 'now'),
    upcoming: relevant.filter((e) => getTemporalStatus(e, now) !== 'now'),
  };
}

// Build rows: row index → spaces in that row
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

  const spaceEvents = useMemo<SpaceEvents>(
    () => (selectedSpace ? getSpaceEvents(selectedSpace, now) : { now: [], upcoming: [] }),
    [selectedSpace, now],
  );
  const allSpaceEvents = useMemo(
    () => [...spaceEvents.now, ...spaceEvents.upcoming],
    [spaceEvents],
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
      <Text style={[styles.subtitle, { color: colors.icon }]}>
        Faculty of Biosciences · UAB · Tap a space to see its events
      </Text>

      {/* Floor plan built from Views */}
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

      {/* Legend */}
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

      {/* Bottom sheet */}
      <Modal
        visible={!!selectedSpace}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSpace(null)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSelectedSpace(null)} />
        <SafeAreaView style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{selectedSpace}</Text>
            <Pressable onPress={() => setSelectedSpace(null)} hitSlop={12}>
              <MaterialIcons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>
          <FlatList
            data={allSpaceEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.sheetList}
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
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
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
  sheetBackdrop: { flex: 1 },
  sheet: { maxHeight: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, elevation: 8 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  sheetList: { paddingVertical: 8, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, paddingHorizontal: 24 },
});
