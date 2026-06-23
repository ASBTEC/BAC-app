import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Rect as SvgRect } from 'react-native-svg';
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
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

// PNG crop dimensions (487,0)→(1115,2200) of the original map
const MAP_W = 628;
const MAP_H = 2200;
const MAP_VIEWPORT_H_FALLBACK = 300;

const EXTERIOR_ID = 'Exterior de la facultat de biociencies';

// Coordinates are in the cropped PNG space (original x − 487, y unchanged)
const SPACES = [
  { id: 'Sala de Graus',                 label: 'Sala de Graus',                 x: 98,  y: 160,  w: 154, h: 74,  type: 'classroom' },
  { id: 'Espacio BusinessBAC (C1)',      label: 'Espacio BusinessBAC (C1)',       x: 99,  y: 251,  w: 390, h: 133, type: 'stand' },
  { id: "Sala d'Actes (C0)",            label: "Sala d'Actes (C0)",             x: 208, y: 473,  w: 158, h: 65,  type: 'classroom' },
  { id: 'Aula PEP Vendrell (C0/1434.)', label: 'Aula PEP Vendrell (C0/1434.)',  x: 313, y: 373,  w: 175, h: 363, type: 'classroom' },
  { id: 'Pasillo ExpoBAC (C2-C1)',      label: 'Pasillo ExpoBAC',               x: 346, y: 755,  w: 232, h: 785, type: 'expo' },
  { id: 'Catering (C0)',                label: 'Catering (C0)',                 x: 228, y: 1660, w: 154, h: 117, type: 'catering' },
  { id: 'Espacio BusinessBAC (C2)',     label: 'Espacio BusinessBAC (C2)',      x: 83,  y: 1785, w: 194, h: 162, type: 'stand' },
] as const;

const ALL_SPACES = [
  ...SPACES,
  { id: EXTERIOR_ID, label: 'Exterior de la Facultat de Biociències' },
];

const ROOM_COLOR: Record<string, string> = {
  classroom: BACColors.lightBlue,
  stand:     BACColors.amber,
  expo:      '#F4A259',
  catering:  '#9B7B5C',
};

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

function getSpaceEvents(spaceId: string, now: Date, events: Event[]): Event[] {
  return events
    .filter((e) => {
      if (spaceId === EXTERIOR_ID) {
        if (e.activity_type !== 'Visita') return false;
      } else {
        if (e.local_location !== spaceId && !e.local_location.includes(spaceId)) return false;
      }
      const s = getTemporalStatus(e, now);
      return s === 'now' || s === 'upcoming' || s === 'future';
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    if (space) setSelectedSpace(space);
  }, [space]);

  // Image dimensions as shared values so pan worklet can access them
  const imgW = screenWidth - 24; // 12px padding each side from buildingPanel margin
  const imgH = imgW * (MAP_H / MAP_W);
  const imgWShared = useSharedValue(imgW);
  const imgHShared = useSharedValue(imgH);
  useEffect(() => {
    imgWShared.value = screenWidth - 24;
    imgHShared.value = (screenWidth - 24) * (MAP_H / MAP_W);
  }, [screenWidth]);

  // Actual rendered viewport height — updated via onLayout, used in pan clamping
  const viewportH = useSharedValue(MAP_VIEWPORT_H_FALLBACK);

  // Pan + pinch-to-zoom shared values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const clampTranslation = (tx: number, ty: number, s: number, iw: number, ih: number, vh: number) => {
    'worklet';
    const maxX = iw * (s - 1) / 2;
    const maxY = ih * (s - 1) / 2;
    const minY = vh - ih * (s + 1) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, tx)),
      y: Math.max(minY, Math.min(maxY, ty)),
    };
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.5, Math.min(8, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      const clamped = clampTranslation(translateX.value, translateY.value, scale.value, imgWShared.value, imgHShared.value, viewportH.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
      savedX.value = clamped.x;
      savedY.value = clamped.y;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const clamped = clampTranslation(savedX.value + e.translationX, savedY.value + e.translationY, scale.value, imgWShared.value, imgHShared.value, viewportH.value);
      translateX.value = clamped.x;
      translateY.value = clamped.y;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const mapGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const mapAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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

  const filterHeader = (
    <View>
      <View style={styles.searchRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar eventos en este espacio"
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
                <Pressable
                  key={key}
                  style={[
                    styles.filterChip,
                    { backgroundColor: active ? BACColors.teal : colors.card, borderColor: active ? BACColors.teal : colors.border },
                  ]}
                  onPress={() => setActiveType(active ? 'all' : key)}>
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
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Map area — 60% of screen height ── */}
      <View style={[styles.mapArea, { height: Math.round(screenHeight * 0.6), borderBottomColor: colors.border }]}>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Toca un espacio para ver sus eventos
        </Text>

        <View style={[styles.buildingPanel, { flex: 1, borderColor: BACColors.navyDark, backgroundColor: scheme === 'dark' ? '#1E2427' : '#F0F4F8' }]}>
          <Text style={[styles.buildingLabel, { color: BACColors.navyDark }]}>
            FACULTAD DE BIOCIENCIAS — UAB
          </Text>

          <View style={styles.mapViewport} onLayout={(e) => { viewportH.value = e.nativeEvent.layout.height; }}>
            <GestureDetector gesture={mapGesture}>
              <Animated.View style={[{ width: imgW, height: imgH }, mapAnimStyle]}>
                <Image
                  source={require('@/assets/images/map/mapa.png')}
                  style={{ width: imgW, height: imgH }}
                  resizeMode="stretch"
                />
                <Svg
                  viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                  width={imgW}
                  height={imgH}
                  style={StyleSheet.absoluteFill}
                >
                  {SPACES.map((room) => {
                    const sel = selectedSpace === room.id;
                    const color = ROOM_COLOR[room.type] ?? BACColors.lightBlue;
                    return (
                      <SvgRect
                        key={room.id}
                        x={room.x}
                        y={room.y}
                        width={room.w}
                        height={room.h}
                        rx={4}
                        fill={sel ? color + 'bb' : color + '44'}
                        stroke={sel ? BACColors.teal : BACColors.navyDark + '88'}
                        strokeWidth={sel ? 4 : 2}
                        onPress={() => setSelectedSpace(room.id === selectedSpace ? null : room.id)}
                      />
                    );
                  })}
                </Svg>
              </Animated.View>
            </GestureDetector>
          </View>

          {/* Exterior — below the building map */}
          <Pressable
            style={[
              styles.exteriorBtn,
              {
                backgroundColor: selectedSpace === EXTERIOR_ID ? BACColors.green + '33' : 'transparent',
                borderColor: selectedSpace === EXTERIOR_ID ? BACColors.green : BACColors.green + '66',
              },
            ]}
            onPress={() => setSelectedSpace(selectedSpace === EXTERIOR_ID ? null : EXTERIOR_ID)}>
            <MaterialIcons name="park" size={14} color={BACColors.green} />
            <Text style={[styles.exteriorLabel, { color: selectedSpace === EXTERIOR_ID ? BACColors.green : colors.text }]}>
              Exterior de la Facultat de Biociències
            </Text>
          </Pressable>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.lightBlue }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Aula</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.amber }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Stands</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F4A259' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>ExpoBAC</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9B7B5C' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Catering</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BACColors.green }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Exterior</Text>
          </View>
        </View>
      </View>

      {/* ── Event panel (only when a space is selected) ── */}
      {selectedSpace && (
        <View style={styles.eventPanel}>
          <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {ALL_SPACES.find((s) => s.id === selectedSpace)?.label ?? selectedSpace}
            </Text>
          </View>

          {viewMode === 'list' ? (
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={styles.listContent}
              data={filteredEvents}
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
                  dimPast={false}
                />
              )}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: colors.icon }]}>
                  No hay eventos actuales ni próximos en este espacio.
                </Text>
              }
            />
          ) : (
            <TimetableView
              events={filteredEvents}
              isSaved={isSaved}
              onToggleSave={handleToggleSave}
              header={filterHeader}
              emptyMessage="No hay eventos que coincidan con los filtros activos este día."
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  mapArea: {
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  buildingPanel: {
    marginHorizontal: 12,
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
  },
  mapViewport: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 6,
  },
  exteriorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
  },
  exteriorLabel: { fontSize: 12, fontWeight: '600' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11 },

  /* Event panel */
  eventPanel: { flex: 1 },
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
  listContent: { paddingTop: 4, paddingBottom: Platform.select({ web: 32, default: 48 }) },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, paddingHorizontal: 24 },
});
