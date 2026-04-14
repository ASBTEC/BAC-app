import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ActivityTypeBadge } from '@/components/ActivityTypeBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { EXHIBITOR_PHOTOS } from '@/constants/exhibitorPhotos';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import BioBACLogo      from '@/assets/images/event_types/logo biobac.svg';
import BusinessBACLogo from '@/assets/images/event_types/logo businessbac.svg';
import ExpoBACLogo     from '@/assets/images/event_types/logo expobac.svg';
import ViveBACLogo     from '@/assets/images/event_types/logo vivebac.svg';
import { SvgProps } from 'react-native-svg';

const CATEGORY_LOGOS: Record<EventCategory, React.FC<SvgProps>> = {
  bioBAC:      BioBACLogo,
  businessBAC: BusinessBACLogo,
  expoBAC:     ExpoBACLogo,
  viveBAC:     ViveBACLogo,
};
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { Event, EventCategory, Exhibitor } from '@/types';
import { formatDateRange, formatTimeSlot, getTemporalStatus } from '@/utils/temporal';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const EVENTS: Event[] = allEvents as Event[];
const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

function openInMaps(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

// Space IDs that exist on the Map tab — must match the `id` field in SPACES (map.tsx)
const MAP_SPACE_IDS = new Set(['Auditorium', 'Classroom 1', 'Classroom 2', 'Laboratory', 'Stand Area', 'Outdoor']);

/** Returns the map tab space ID for an event, or null if no match. */
function getMapSpace(event: Event): string | null {
  if (MAP_SPACE_IDS.has(event.local_location)) return event.local_location;
  if (event.activity_type === 'outdoor_activity') return 'Outdoor';
  return null;
}


export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();

  const event = useMemo(() => EVENTS.find((e) => e.id === id), [id]);
  const exhibitors = useMemo<Exhibitor[]>(() => {
    if (!event?.exhibitor_ids) return [];
    return event.exhibitor_ids
      .map((eid) => EXHIBITORS.find((ex) => ex.id === eid))
      .filter(Boolean) as Exhibitor[];
  }, [event]);

  const saved = event ? isSaved(event.id) : false;

  const handleToggleSave = useCallback(() => {
    if (!event) return;
    const willSave = !saved;
    toggleEvent(event.id);
    if (willSave && settings.enabled) {
      scheduleEventNotification(event, settings.leadTime);
    } else {
      cancelEventNotification(event.id);
    }
  }, [event, saved, toggleEvent, settings, scheduleEventNotification, cancelEventNotification]);

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Evento no encontrado.</Text>
      </View>
    );
  }

  const status = getTemporalStatus(event);
  const statusColors = { now: BACColors.teal, upcoming: BACColors.amber, past: BACColors.grey, future: BACColors.grey };
  const statusColor = statusColors[status];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      {/* Status banner */}
      {(status === 'now' || status === 'upcoming') && (
        <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
          <Text style={styles.statusBannerText}>
            {status === 'now' ? '● En curso ahora' : '⏳ Comienza pronto'}
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: BACColors.navyDark }]}>
        <View style={styles.badgeRow}>
          <ActivityTypeBadge type={event.activity_type} />
          <CategoryBadge category={event.category} />
        </View>
        <Text style={styles.title}>{event.title}</Text>
        {(() => {
          const CategoryLogo = CATEGORY_LOGOS[event.category];
          return (
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeStack}>
                <Text style={styles.date}>{formatDateRange(event.start_time, event.end_time)}</Text>
                <Text style={styles.time}>{formatTimeSlot(event.start_time, event.end_time)}</Text>
              </View>
              {CategoryLogo && (
                <View style={styles.categoryLogoWrap}>
                  <CategoryLogo width={120} height={64} />
                </View>
              )}
            </View>
          );
        })()}
      </View>

      {/* Location */}
      {(() => {
        const mapSpace = getMapSpace(event);
        return (
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <MaterialIcons name="location-on" size={20} color={BACColors.teal} />
            {mapSpace ? (
              <Pressable
                style={styles.locationLink}
                onPress={() => router.push({ pathname: '/(tabs)/map', params: { space: mapSpace } } as never)}>
                <Text style={[styles.infoText, { color: BACColors.teal }]}>{event.local_location}</Text>
                <MaterialIcons name="chevron-right" size={16} color={BACColors.teal} />
              </Pressable>
            ) : (
              <Text style={[styles.infoText, { color: colors.text }]}>{event.local_location}</Text>
            )}
            {event.location && (
              <Pressable
                style={[styles.mapsBtn, { borderColor: BACColors.teal }]}
                onPress={() => openInMaps(event.location!)}>
                <MaterialIcons name="map" size={14} color={BACColors.teal} />
                <Text style={[styles.mapsBtnText, { color: BACColors.teal }]}>Abrir en Google Maps</Text>
              </Pressable>
            )}
          </View>
        );
      })()}

      {/* Description */}
      {event.description && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Acerca de</Text>
          <Text style={[styles.description, { color: colors.text }]}>{event.description}</Text>
        </View>
      )}

      {/* Exhibitors */}
      {exhibitors.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>
            {exhibitors.some((e) => e.exhibitor_type === 'speaker') ? 'Ponentes' : 'Organizadores'}
          </Text>
          {exhibitors.map((ex) => (
            <Pressable
              key={ex.id}
              style={[styles.exhibitorRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/exhibitor/${ex.id}` as never)}>
              <View style={[styles.exhibitorAvatar, { backgroundColor: BACColors.lightBlue }]}>
                {ex.photo && EXHIBITOR_PHOTOS[ex.photo] ? (
                  <Image source={EXHIBITOR_PHOTOS[ex.photo]} style={styles.exhibitorAvatarImage} resizeMode="cover" />
                ) : (
                  <MaterialIcons
                    name={ex.exhibitor_type === 'speaker' ? 'person' : 'business'}
                    size={24}
                    color={BACColors.navyDark}
                  />
                )}
              </View>
              <View style={styles.exhibitorInfo}>
                <Text style={[styles.exhibitorName, { color: colors.text }]}>{ex.name}</Text>
                {ex.description && (
                  <Text style={[styles.exhibitorDesc, { color: colors.icon }]} numberOfLines={2}>
                    {ex.description}
                  </Text>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.icon} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Save button */}
      <Pressable
        style={[styles.saveBtn, { backgroundColor: saved ? BACColors.teal : colors.card, borderColor: BACColors.teal }]}
        onPress={handleToggleSave}>
        <MaterialIcons name={saved ? 'bookmark' : 'bookmark-border'} size={20} color={saved ? '#fff' : BACColors.teal} />
        <Text style={[styles.saveBtnText, { color: saved ? '#fff' : BACColors.teal }]}>
          {saved ? 'Eliminar de mi agenda' : 'Añadir a mi agenda'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 40 },
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statusBannerText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  header: {
    padding: 20,
    paddingBottom: 24,
    gap: 8,
  },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  title: { color: '#fff', fontSize: 20, fontFamily: OrbitronFonts.bold, lineHeight: 28 },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  categoryLogoWrap: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateTimeStack: { gap: 4 },
  date: { color: BACColors.lightBlue, fontSize: 13, fontWeight: '600' },
  time: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  infoText: { flex: 1, fontSize: 15 },
  locationLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapsBtnText: { fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  sectionTitle: { fontSize: 11, fontFamily: OrbitronFonts.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 15, lineHeight: 22 },
  exhibitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  exhibitorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  exhibitorAvatarImage: {
    width: 44,
    height: 44,
  },
  exhibitorInfo: { flex: 1, gap: 2 },
  exhibitorName: { fontSize: 15, fontWeight: '700' },
exhibitorDesc: { fontSize: 12, lineHeight: 16 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 14,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});
