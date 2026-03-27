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
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';
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
  return event.exhibitor_ids.map((id) => EXHIBITORS.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
}

// Congress venue spaces — must match event local_location values
const SPACES = [
  { id: 'Auditorium', label: 'Auditorium', type: 'classroom' as const, x: 30, y: 50, w: 220, h: 90 },
  { id: 'Classroom 1', label: 'Classroom 1', type: 'classroom' as const, x: 30, y: 170, w: 100, h: 70 },
  { id: 'Classroom 2', label: 'Classroom 2', type: 'classroom' as const, x: 150, y: 170, w: 100, h: 70 },
  { id: 'Laboratory', label: 'Laboratory', type: 'classroom' as const, x: 30, y: 265, w: 100, h: 70 },
  { id: 'Stand Area', label: 'Stand Area', type: 'stand' as const, x: 150, y: 265, w: 100, h: 70 },
];

const SPACE_COLORS = {
  classroom: BACColors.lightBlue,
  stand: BACColors.amber,
};

interface SpaceEvents {
  now: Event[];
  upcoming: Event[];
}

function getSpaceEvents(spaceId: string, now: Date): SpaceEvents {
  const relevant = EVENTS.filter((e) => {
    if (e.activity_type === 'stand') return false; // stands span whole congress
    if (!e.local_location.includes(spaceId) && e.local_location !== spaceId) return false;
    const status = getTemporalStatus(e, now);
    return status === 'now' || status === 'upcoming' || status === 'future';
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return {
    now: relevant.filter((e) => getTemporalStatus(e, now) === 'now'),
    upcoming: relevant.filter((e) => getTemporalStatus(e, now) !== 'now'),
  };
}

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [now] = useState(new Date());

  const spaceEvents = useMemo(
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
        Faculty of Biosciences · UAB · Tap a space to see events
      </Text>

      {/* SVG Floor Plan */}
      <View style={styles.mapContainer}>
        <Svg width="280" height="360" viewBox="0 0 280 360">
          {/* Building outline */}
          <Rect x="20" y="30" width="240" height="320" rx="8" fill={scheme === 'dark' ? '#1E2427' : '#F0F4F8'} stroke={BACColors.navyDark} strokeWidth="2" />

          {/* Floor label */}
          <SvgText x="140" y="22" textAnchor="middle" fontSize="11" fill={BACColors.navyDark} fontWeight="700">
            FACULTY OF BIOSCIENCES — UAB
          </SvgText>

          {SPACES.map((space) => {
            const selected = selectedSpace === space.id;
            const fill = selected
              ? BACColors.teal
              : SPACE_COLORS[space.type];
            return (
              <React.Fragment key={space.id}>
                <Rect
                  x={space.x}
                  y={space.y}
                  width={space.w}
                  height={space.h}
                  rx="6"
                  fill={fill}
                  stroke={selected ? BACColors.navyDark : BACColors.navyDark + '44'}
                  strokeWidth={selected ? 2.5 : 1.5}
                  onPress={() => setSelectedSpace(space.id === selectedSpace ? null : space.id)}
                />
                <SvgText
                  x={space.x + space.w / 2}
                  y={space.y + space.h / 2 - 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill={selected ? '#fff' : BACColors.navyDark}
                  fontWeight="700"
                  onPress={() => setSelectedSpace(space.id === selectedSpace ? null : space.id)}>
                  {space.label}
                </SvgText>
                <SvgText
                  x={space.x + space.w / 2}
                  y={space.y + space.h / 2 + 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill={selected ? '#ffffffcc' : BACColors.navyDark + 'aa'}
                  onPress={() => setSelectedSpace(space.id === selectedSpace ? null : space.id)}>
                  {space.type === 'classroom' ? 'Classroom' : 'Stand Zone'}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Compass rose */}
          <Circle cx="252" cy="330" r="14" fill={BACColors.navyDark + '22'} />
          <SvgText x="252" y="334" textAnchor="middle" fontSize="10" fill={BACColors.navyDark} fontWeight="700">N</SvgText>
        </Svg>
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

      {/* Bottom sheet: events in selected space */}
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
  subtitle: { fontSize: 12, marginTop: 12, marginBottom: 8, textAlign: 'center', paddingHorizontal: 16 },
  mapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12 },
  sheetBackdrop: { flex: 1 },
  sheet: {
    maxHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 8 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  sheetList: { paddingVertical: 8, paddingBottom: 24 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, paddingHorizontal: 24 },
});
