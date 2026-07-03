import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnUI, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { EventCard } from '@/components/EventCard';
import { FilterDropdown } from '@/components/FilterDropdown';
import { TimetableView } from '@/components/TimetableView';
import { BACColors, Colors, OrbitronFonts, TrackColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useData } from '@/context/data-context';
import { ActivityType, Event, EventCategory, Exhibitor } from '@/types';
import { getTemporalStatus } from '@/utils/temporal';

type ViewMode = 'list' | 'timetable';
type FilterCategory = EventCategory | 'all';
type FilterType = ActivityType | 'all';
type FilterTrack = string | 'all';

const TRACK_FILTERS = Object.keys(TrackColors).map((key) => ({ key, label: key }));

const CATEGORY_FILTERS: { key: FilterCategory; label: string }[] = [
  { key: 'bioBAC',      label: 'BioBAC' },
  { key: 'businessBAC', label: 'BusinessBAC' },
  { key: 'expoBAC',     label: 'ExpoBAC' },
  { key: 'general',     label: 'General' },
  { key: 'viveBAC',     label: 'ViveBAC' },
];

const TYPE_FILTERS: { key: FilterType; label: string; iconName: string }[] = [
  { key: 'Ponencia',                label: 'Ponencia',                iconName: 'mic' },
  { key: 'Presentación flash',      label: 'Presentación flash',      iconName: 'bolt' },
  { key: 'Acto institucional',      label: 'Acto institucional',      iconName: 'account-balance' },
  { key: 'Mesa redonda',            label: 'Mesa redonda',            iconName: 'groups' },
  { key: 'Debate',                  label: 'Debate',                  iconName: 'forum' },
  { key: 'Stand',                   label: 'Stand',                   iconName: 'storefront' },
  { key: 'Curso',                   label: 'Curso',                   iconName: 'school' },
  { key: 'Taller',                  label: 'Taller',                  iconName: 'build' },
  { key: 'Comidas y coffee breaks', label: 'Comidas y coffee breaks', iconName: 'restaurant' },
  { key: 'Presentación de poster',  label: 'Presentación de poster',  iconName: 'article' },
  { key: 'Speed Meeting',           label: 'Speed Meeting',           iconName: 'speed' },
  { key: 'Visita',                  label: 'Visita',                  iconName: 'park' },
];

// Full map image dimensions (Plano completo.png — 1587×2245)
// Old mapa.png was a crop of this: (487,0)→(1115,2200); x coords below are x_crop + 487
const MAP_W = 1587;
const MAP_H = 2245;
const MAP_VIEWPORT_H_FALLBACK = 300;

const EXTERIOR_ID  = 'Exterior de la facultat de biociencies';
const AUDITORI_ID  = 'Auditori de Lletres';
const AUDITORI_COLOR = '#7C3AED';

// Coordinates in Plano completo.png space: x = x_crop + 487, y = y_crop × (2245/2200)
const SPACES = [
  { id: 'Sala de Graus',                 label: 'Sala de Graus',                 x: 585, y: 163,  w: 154, h: 75,  type: 'classroom' },
  { id: 'Espacio BusinessBAC (C1)',      label: 'Espacio BusinessBAC (C1)',       x: 586, y: 256,  w: 390, h: 156, type: 'stand' },
  { id: "Sala d'Actes (C0)",            label: "Sala d'Actes (C0)",             x: 695, y: 483,  w: 158, h: 66,  type: 'classroom' },
  { id: 'Aula PEP Vendrell (C0/1434.)', label: 'Aula PEP Vendrell (C0/1434.)',  x: 800, y: 646,  w: 175, h: 113, type: 'classroom' },
  { id: 'Pasillo ExpoBAC (C2-C1)',      label: 'Pasillo ExpoBAC',               x: 833, y: 770,  w: 232, h: 801, type: 'expo' },
  { id: 'Catering (C0)',                label: 'Catering (C0)',                 x: 715, y: 1694, w: 154, h: 119, type: 'catering' },
  { id: 'Espacio BusinessBAC (C2)',     label: 'Espacio BusinessBAC (C2)',      x: 570, y: 1822, w: 194, h: 165, type: 'stand' },
] as const;

const ALL_SPACES = [
  ...SPACES,
  { id: AUDITORI_ID, label: 'Auditori de Lletres' },
  { id: EXTERIOR_ID, label: 'Exterior de la UAB' },
];

const ROOM_COLOR: Record<string, string> = {
  classroom: BACColors.lightBlue,
  stand:     '#EF4444',   // red
  expo:      '#EAB308',   // pink
  catering:  '#F97316',   // orange
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

// Clamp translation so the map always fills (or is centered in) the viewport.
// Works correctly for any scale, including scale < 1 where the map is smaller than the viewport.
function clampTranslation(tx: number, ty: number, s: number, iw: number, ih: number, vh: number) {
  'worklet';
  const scaledW = iw * s;
  const scaledH = ih * s;
  // X: center horizontally when map is narrower than viewport; constrain when wider
  const x = scaledW < iw
    ? 0
    : Math.max(-(scaledW - iw) / 2, Math.min((scaledW - iw) / 2, tx));
  // Y: center vertically when map is shorter than viewport; constrain when taller
  const y = scaledH < vh
    ? (vh - ih) / 2
    : Math.max(vh - ih * (s + 1) / 2, Math.min(ih * (s - 1) / 2, ty));
  return { x, y };
}

const ZOOM_FACTOR = 1.6;
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;

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
  const [viewMode, setViewMode] = useState<ViewMode>('timetable');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [activeTrack, setActiveTrack] = useState<FilterTrack>('all');
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    if (space) setSelectedSpace(space);
  }, [space]);

  // Image dimensions as shared values so pan worklet can access them
  // mapViewport width = screen - 2×margin(12) - 2×border(2) - 2×padding(10) = screen - 48
  const imgW = screenWidth - 48;
  const imgH = imgW * (MAP_H / MAP_W);
  const imgWShared = useSharedValue(imgW);
  const imgHShared = useSharedValue(imgH);
  useEffect(() => {
    imgWShared.value = screenWidth - 48;
    imgHShared.value = (screenWidth - 48) * (MAP_H / MAP_W);
  }, [screenWidth]);

  // Actual rendered viewport height — updated via onLayout, used in pan clamping
  const viewportH = useSharedValue(MAP_VIEWPORT_H_FALLBACK);

  // Estimate initial scale so the whole map fits in view (approx viewport height = 60% screen - UI chrome)
  const estimatedViewportH = Math.max(80, Math.round(screenHeight * 0.7) - 175);
  const initialScale = estimatedViewportH / imgH;
  const initialY = (estimatedViewportH - imgH) / 2; // center vertically at initial scale

  // Pan + pinch-to-zoom shared values
  const scale = useSharedValue(initialScale);
  const savedScale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(initialY);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(initialY);

  // Set precise initial scale/position once the real viewport height is known
  const hasInitialized = useRef(false);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * e.scale));
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
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10])
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

  const handleZoom = (factor: number) => {
    runOnUI(() => {
      'worklet';
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * factor));
      scale.value = withTiming(newScale, { duration: 250 });
      savedScale.value = newScale;
      const clamped = clampTranslation(translateX.value, translateY.value, newScale, imgWShared.value, imgHShared.value, viewportH.value);
      translateX.value = withTiming(clamped.x, { duration: 250 });
      translateY.value = withTiming(clamped.y, { duration: 250 });
      savedX.value = clamped.x;
      savedY.value = clamped.y;
    })();
  };

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
      if (activeTrack !== 'all' && !e.biotech_color?.includes(activeTrack)) return false;
      if (search.trim() && !matchesSearch(e, search.trim(), getExhibitorsForEvent(e, exhibitors))) return false;
      return true;
    });
  }, [spaceEvents, exhibitors, activeCategory, activeType, activeTrack, search]);

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

  const mapSection = (
    <View style={[styles.mapArea, { height: Math.round(screenHeight * 0.7), borderBottomColor: colors.border }]}>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Toca un espacio para ver sus eventos
      </Text>

      <View style={[styles.buildingPanel, { flex: 1, borderColor: BACColors.navyDark, backgroundColor: scheme === 'dark' ? '#1E2427' : '#F0F4F8' }]}>
        <Text style={[styles.buildingLabel, { color: BACColors.navyDark }]}>
          FACULTAD DE BIOCIENCIAS — UAB
        </Text>

        <View
          style={styles.mapViewport}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            viewportH.value = h;
            if (!hasInitialized.current && imgHShared.value > 0) {
              hasInitialized.current = true;
              const fitScale = h / imgHShared.value;
              scale.value = fitScale;
              savedScale.value = fitScale;
              const clamped = clampTranslation(0, 0, fitScale, imgWShared.value, imgHShared.value, h);
              translateX.value = clamped.x;
              translateY.value = clamped.y;
              savedX.value = clamped.x;
              savedY.value = clamped.y;
            }
          }}
        >
          <GestureDetector gesture={mapGesture}>
            <Animated.View style={[{ width: imgW, height: imgH }, mapAnimStyle]}>
              <Image
                source={require('@/assets/images/map/Plano completo.png')}
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

          {/* Zoom buttons */}
          <View style={styles.zoomControls}>
            <Pressable style={styles.zoomBtn} onPress={() => handleZoom(ZOOM_FACTOR)}>
              <MaterialIcons name="add" size={16} color="#fff" />
            </Pressable>
            <Pressable style={styles.zoomBtn} onPress={() => handleZoom(1 / ZOOM_FACTOR)}>
              <MaterialIcons name="remove" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Auditori de Lletres + Exterior — same row */}
        <View style={styles.externalBtnsRow}>
          <Pressable
            style={[
              styles.exteriorBtn,
              { flex: 1,
                backgroundColor: selectedSpace === AUDITORI_ID ? AUDITORI_COLOR + '22' : 'transparent',
                borderColor: selectedSpace === AUDITORI_ID ? AUDITORI_COLOR : AUDITORI_COLOR + '66',
              },
            ]}
            onPress={() => setSelectedSpace(selectedSpace === AUDITORI_ID ? null : AUDITORI_ID)}>
            <MaterialIcons name="theater-comedy" size={14} color={AUDITORI_COLOR} />
            <Text style={[styles.exteriorLabel, { color: selectedSpace === AUDITORI_ID ? AUDITORI_COLOR : colors.text }]}>
              Auditori de Lletres
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.exteriorBtn,
              { flex: 1,
                backgroundColor: selectedSpace === EXTERIOR_ID ? BACColors.green + '33' : 'transparent',
                borderColor: selectedSpace === EXTERIOR_ID ? BACColors.green : BACColors.green + '66',
              },
            ]}
            onPress={() => setSelectedSpace(selectedSpace === EXTERIOR_ID ? null : EXTERIOR_ID)}>
            <MaterialIcons name="park" size={14} color={BACColors.green} />
            <Text style={[styles.exteriorLabel, { color: selectedSpace === EXTERIOR_ID ? BACColors.green : colors.text }]}>
              Exterior de la UAB
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BACColors.lightBlue }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Aula</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Stands</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>ExpoBAC</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Catering</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AUDITORI_COLOR }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Auditori</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BACColors.green }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Exterior</Text>
        </View>
      </View>
    </View>
  );

  const spaceHeader = selectedSpace ? (
    <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
      <Text style={[styles.panelTitle, { color: colors.text }]}>
        {ALL_SPACES.find((s) => s.id === selectedSpace)?.label ?? selectedSpace}
      </Text>
    </View>
  ) : null;

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
          <CategoryDropdown
            value={activeCategory}
            options={CATEGORY_FILTERS}
            onChange={setActiveCategory}
          />



          <FilterDropdown
            value={activeType}
            options={TYPE_FILTERS}
            onChange={(k) => setActiveType(k as FilterType)}
            allLabel="Todos los tipos"
          />



          <FilterDropdown
            value={activeTrack}
            options={TRACK_FILTERS}
            onChange={setActiveTrack}
            allLabel="Todas las temáticas"
            renderIcon={(key, _color, size) => (
              <View style={{
                width: size * 0.75,
                height: size * 0.75,
                borderRadius: size * 0.375,
                backgroundColor: TrackColors[key] ?? colors.icon,
                borderWidth: 1.5,
                borderColor: 'rgba(128,128,128,0.35)',
              }} />
            )}
          />
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {!selectedSpace ? (
        mapSection
      ) : viewMode === 'list' ? (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<>{mapSection}{spaceHeader}{filterHeader}</>}
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
          header={<>{mapSection}{spaceHeader}{filterHeader}</>}
          emptyMessage="No hay eventos que coincidan con los filtros activos este día."
        />
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
    fontSize: 13,
    fontWeight: '600',
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
  zoomControls: {
    position: 'absolute',
    bottom: 10,
    right: 8,
    gap: 5,
  },
  zoomBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  externalBtnsRow: {
    flexDirection: 'row',
    gap: 8,
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
