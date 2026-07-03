import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Rect as SvgRect, Text as SvgText } from 'react-native-svg';
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
type MapLevel = 'uab' | 'facultats' | 'biociencies' | 'lletres' | 'torres';

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

// ── Map hierarchy ──────────────────────────────────────────────────────────────

const EXTERIOR_ID  = 'Exterior de la facultat de biociencies';
const AUDITORI_COLOR = '#7C3AED';

type MapConfig = {
  w: number; h: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
  parent: MapLevel | null;
  label: string;
  title: string;
};

const MAP_CONFIGS: Record<MapLevel, MapConfig> = {
  uab:         { w: 1229, h:  864, source: require('@/assets/images/map/uab.png'),         parent: null,        label: 'Campus UAB',          title: 'CAMPUS — UNIVERSITAT AUTÒNOMA DE BARCELONA' },
  facultats:   { w: 1365, h:  768, source: require('@/assets/images/map/facultats.png'),   parent: 'uab',       label: 'Facultats',           title: 'FACULTATS DEL CONGRESO — UAB' },
  biociencies: { w: 1587, h: 2245, source: require('@/assets/images/map/biociencies.png'), parent: 'facultats', label: 'Fac. Biociències',    title: 'FACULTAD DE BIOCIENCIAS — UAB' },
  lletres:     { w: 1587, h: 2245, source: require('@/assets/images/map/lletres.png'),     parent: 'facultats', label: 'Fac. Lletres',        title: 'FACULTAD DE FILOSOFIA I LLETRES — UAB' },
  torres:      { w: 1587, h: 2245, source: require('@/assets/images/map/torres.png'),      parent: 'facultats', label: 'Torres C',            title: 'TORRES C (BIOCIENCIAS) — UAB' },
};

// Drill-down tap areas on overview maps.
// Coordinates are in each image's own pixel space — adjust x/y/w/h if tap areas feel off.
type Hotspot = { target: MapLevel; label: string; x: number; y: number; w: number; h: number; color: string };

const UAB_HOTSPOTS: Hotspot[] = [
  { target: 'facultats', label: 'Facultats BAC', x: 540, y: 50, w: 300, h: 210, color: BACColors.teal },
];

const FACULTATS_HOTSPOTS: Hotspot[] = [
  { target: 'lletres',     label: 'Fac. Lletres',      x: 175, y:  75, w: 355, h: 460, color: AUDITORI_COLOR },
  { target: 'biociencies', label: 'Fac. Biociències',  x: 555, y: 105, w: 380, h: 465, color: BACColors.teal },
  { target: 'torres',      label: 'Torres C',           x: 830, y:  40, w: 255, h: 160, color: '#EF4444' },
];

// ── Room overlays on detail maps ───────────────────────────────────────────────

type RoomSpace = { id: string; label: string; x: number; y: number; w: number; h: number; type: string };

const SPACES_BIO: RoomSpace[] = [
  { id: 'Sala de Graus',                 label: 'Sala de Graus',                 x: 585, y:  163, w: 154, h:  75, type: 'classroom' },
  { id: 'Espacio BusinessBAC (C1)',      label: 'Espacio BusinessBAC (C1)',       x: 586, y:  256, w: 390, h: 156, type: 'stand' },
  { id: "Sala d'Actes (C0)",            label: "Sala d'Actes (C0)",             x: 695, y:  483, w: 158, h:  66, type: 'classroom' },
  { id: 'Aula PEP Vendrell (C0/1434.)', label: 'Aula PEP Vendrell (C0/1434.)',  x: 800, y:  646, w: 175, h: 113, type: 'classroom' },
  { id: 'Pasillo ExpoBAC (C2-C1)',      label: 'Pasillo ExpoBAC',               x: 833, y:  770, w: 232, h: 801, type: 'expo' },
  { id: 'Catering (C0)',                label: 'Catering (C0)',                 x: 715, y: 1694, w: 154, h: 119, type: 'catering' },
  { id: 'Espacio BusinessBAC (C2)',     label: 'Espacio BusinessBAC (C2)',      x: 570, y: 1822, w: 194, h: 165, type: 'stand' },
];

// Lletres: Auditori is the only current event location. Coordinates in 1587×2245 space.
const SPACES_LLETRES: RoomSpace[] = [
  { id: 'Auditori de Lletres', label: 'Auditori de Lletres', x: 280, y: 50, w: 425, h: 375, type: 'auditori' },
];

// Torres: no event locations yet; add entries here when events reference Torres rooms.
const SPACES_TORRES: RoomSpace[] = [];

const SPACES_BY_LEVEL: Record<MapLevel, RoomSpace[]> = {
  uab:         [],
  facultats:   [],
  biociencies: SPACES_BIO,
  lletres:     SPACES_LLETRES,
  torres:      SPACES_TORRES,
};

const ALL_SPACES: { id: string; label: string }[] = [
  ...SPACES_BIO,
  ...SPACES_LLETRES,
  { id: EXTERIOR_ID, label: 'Exterior de la UAB' },
];

const ROOM_COLOR: Record<string, string> = {
  classroom: BACColors.lightBlue,
  stand:     '#EF4444',
  expo:      '#EAB308',
  catering:  '#F97316',
  auditori:  AUDITORI_COLOR,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function clampTranslation(tx: number, ty: number, s: number, iw: number, ih: number, vh: number) {
  'worklet';
  const scaledW = iw * s;
  const scaledH = ih * s;
  const x = scaledW < iw
    ? 0
    : Math.max(-(scaledW - iw) / 2, Math.min((scaledW - iw) / 2, tx));
  const y = scaledH < vh
    ? (vh - ih) / 2
    : Math.max(vh - ih * (s + 1) / 2, Math.min(ih * (s - 1) / 2, ty));
  return { x, y };
}

const ZOOM_FACTOR = 1.6;
const MIN_SCALE = 0.05;
const MAX_SCALE = 8;
const MAP_VIEWPORT_H_FALLBACK = 300;

function getSpaceEvents(spaceId: string, now: Date, events: Event[]): Event[] {
  return events
    .filter((e) => {
      if (spaceId === EXTERIOR_ID) {
        if (e.activity_type !== 'Visita') return false;
      } else {
        if (e.local_location !== spaceId && !e.local_location.includes(spaceId) && !spaceId.includes(e.local_location)) return false;
      }
      const s = getTemporalStatus(e, now);
      return s === 'now' || s === 'upcoming' || s === 'future';
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const { events, exhibitors } = useData();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [mapLevel, setMapLevel] = useState<MapLevel>('uab');
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
    if (!space) return;
    // Resolve the raw location string to the room that contains it
    const allRooms = [...SPACES_BIO, ...SPACES_LLETRES];
    const match = allRooms.find(
      (r) => r.id === space || r.id.includes(space) || space.includes(r.id),
    );
    if (match) {
      setSelectedSpace(match.id);
      setMapLevel(SPACES_LLETRES.some((s) => s.id === match.id) ? 'lletres' : 'biociencies');
    } else {
      // Exterior or unknown → just show biociencies with the raw location
      setSelectedSpace(space);
      setMapLevel('biociencies');
    }
  }, [space]);

  const mapCfg = MAP_CONFIGS[mapLevel];
  const imgW = screenWidth - 48;
  const imgH = imgW * (mapCfg.h / mapCfg.w);

  const imgWShared = useSharedValue(imgW);
  const imgHShared = useSharedValue(imgH);
  const viewportH = useSharedValue(MAP_VIEWPORT_H_FALLBACK);
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);
  const hasInitialized = useRef(false);

  // Re-initialize zoom whenever the map level changes
  useEffect(() => {
    const newImgW = screenWidth - 48;
    const newImgH = newImgW * (MAP_CONFIGS[mapLevel].h / MAP_CONFIGS[mapLevel].w);
    imgWShared.value = newImgW;
    imgHShared.value = newImgH;
    const vH = viewportH.value;
    if (vH > 80 && newImgH > 0) {
      const fitScale = vH / newImgH;
      const clamped = clampTranslation(0, 0, fitScale, newImgW, newImgH, vH);
      scale.value = fitScale;
      savedScale.value = fitScale;
      translateX.value = clamped.x;
      translateY.value = clamped.y;
      savedX.value = clamped.x;
      savedY.value = clamped.y;
      hasInitialized.current = true;
    } else {
      hasInitialized.current = false;
    }
  }, [mapLevel]);

  useEffect(() => {
    imgWShared.value = screenWidth - 48;
    imgHShared.value = (screenWidth - 48) * (MAP_CONFIGS[mapLevel].h / MAP_CONFIGS[mapLevel].w);
  }, [screenWidth]);

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
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * factor));
    const clamped = clampTranslation(translateX.value, translateY.value, newScale, imgWShared.value, imgHShared.value, viewportH.value);
    scale.value = withTiming(newScale, { duration: 250 });
    savedScale.value = newScale;
    translateX.value = withTiming(clamped.x, { duration: 250 });
    translateY.value = withTiming(clamped.y, { duration: 250 });
    savedX.value = clamped.x;
    savedY.value = clamped.y;
  };

  const navigateTo = (level: MapLevel) => {
    setSelectedSpace(null);
    setMapLevel(level);
  };

  const goBack = () => {
    const parent = MAP_CONFIGS[mapLevel].parent;
    if (parent) navigateTo(parent);
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

  // ── Map SVG overlays (hotspots + room rects) ───────────────────────────────

  const hotspots: Hotspot[] =
    mapLevel === 'uab' ? UAB_HOTSPOTS :
    mapLevel === 'facultats' ? FACULTATS_HOTSPOTS : [];

  const roomSpaces = SPACES_BY_LEVEL[mapLevel];

  const svgOverlay = (
    <Svg
      viewBox={`0 0 ${mapCfg.w} ${mapCfg.h}`}
      width={imgW}
      height={imgH}
      style={StyleSheet.absoluteFill}
    >
      {/* Drill-down hotspots for overview maps */}
      {hotspots.map((hs) => (
        <React.Fragment key={hs.target}>
          <SvgRect
            x={hs.x}
            y={hs.y}
            width={hs.w}
            height={hs.h}
            rx={8}
            fill={hs.color + '33'}
            stroke={hs.color}
            strokeWidth={4}
            strokeDasharray="12,8"
            onPress={() => navigateTo(hs.target)}
          />
          <SvgText
            x={hs.x + hs.w / 2}
            y={hs.y + hs.h / 2}
            fontSize={Math.min(hs.w, hs.h) * 0.13}
            fontWeight="700"
            fill={hs.color}
            textAnchor="middle"
            alignmentBaseline="middle"
            onPress={() => navigateTo(hs.target)}
          >
            {hs.label}
          </SvgText>
        </React.Fragment>
      ))}

      {/* Room overlays for detail maps */}
      {roomSpaces.map((room) => {
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
  );

  // ── Subtitle text per level ────────────────────────────────────────────────
  const subtitle =
    mapLevel === 'uab' || mapLevel === 'facultats'
      ? 'Toca un edificio para explorar su mapa'
      : 'Toca un espacio para ver sus eventos';

  // ── External (non-map) space buttons ──────────────────────────────────────
  const externalButtons = mapLevel === 'biociencies' ? (
    <View style={styles.externalBtnsRow}>
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
          Exterior de la UAB
        </Text>
      </Pressable>
    </View>
  ) : null;

  // ── Legend per level ───────────────────────────────────────────────────────
  const legend = (() => {
    if (mapLevel === 'uab') return null;
    if (mapLevel === 'facultats') return (
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AUDITORI_COLOR }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Fac. Lletres</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BACColors.teal }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Fac. Biociències</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Torres C</Text>
        </View>
      </View>
    );
    if (mapLevel === 'lletres') return (
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AUDITORI_COLOR }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Auditori</Text>
        </View>
      </View>
    );
    if (mapLevel === 'torres') return null;
    // biociencies
    return (
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
          <View style={[styles.legendDot, { backgroundColor: BACColors.green }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Exterior</Text>
        </View>
      </View>
    );
  })();

  // ── Map section (the whole map panel + legend) ─────────────────────────────
  const mapSection = (
    <View style={[styles.mapArea, { height: Math.round(screenHeight * 0.7), borderBottomColor: colors.border }]}>
      <Text style={[styles.subtitle, { color: colors.text }]}>{subtitle}</Text>

      <View style={[styles.buildingPanel, { flex: 1, borderColor: BACColors.navyDark, backgroundColor: scheme === 'dark' ? '#1E2427' : '#F0F4F8' }]}>

        {/* Header row: back button (if not root) + level title */}
        <View style={styles.panelHeaderRow}>
          {MAP_CONFIGS[mapLevel].parent !== null ? (
            <Pressable style={styles.backBtn} onPress={goBack}>
              <MaterialIcons name="arrow-back-ios" size={12} color={BACColors.navyDark} />
              <Text style={[styles.backBtnLabel, { color: BACColors.navyDark }]}>
                {MAP_CONFIGS[MAP_CONFIGS[mapLevel].parent!].label}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}
          <Text style={[styles.buildingLabel, { color: BACColors.navyDark, flex: 1 }]} numberOfLines={1}>
            {mapCfg.title}
          </Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View
          style={styles.mapViewport}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            viewportH.value = h;
            if (!hasInitialized.current && imgHShared.value > 0) {
              hasInitialized.current = true;
              const fitScale = h / imgHShared.value;
              const clamped = clampTranslation(0, 0, fitScale, imgWShared.value, imgHShared.value, h);
              scale.value = fitScale;
              savedScale.value = fitScale;
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
                source={mapCfg.source}
                style={{ width: imgW, height: imgH }}
                resizeMode="stretch"
              />
              {svgOverlay}
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

        {externalButtons}
      </View>

      {legend}
    </View>
  );

  const spaceHeader = selectedSpace ? (
    <View style={[styles.eventPanelHeader, { borderBottomColor: colors.border }]}>
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
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buildingLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    minWidth: 64,
  },
  backBtnLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  backBtnPlaceholder: {
    minWidth: 64,
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
    flex: 1,
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
  eventPanelHeader: {
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

  /* List */
  listContent: { paddingTop: 4, paddingBottom: Platform.select({ web: 32, default: 48 }) },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, paddingHorizontal: 24 },
});
