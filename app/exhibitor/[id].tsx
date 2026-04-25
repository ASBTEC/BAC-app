import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '@/components/EventCard';
import { EXHIBITOR_PHOTOS } from '@/constants/exhibitorPhotos';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { Event, Exhibitor } from '@/types';
import allEvents from '@/data/events.json';
import allExhibitors from '@/data/exhibitors.json';

const EVENTS: Event[] = allEvents as Event[];
const EXHIBITORS: Exhibitor[] = allExhibitors as Exhibitor[];

function getExhibitorsForEvent(event: Event): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids.map((id) => EXHIBITORS.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
}


export default function ExhibitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();

  const exhibitor = useMemo(() => EXHIBITORS.find((e) => e.id === id), [id]);

  const associatedEvents = useMemo(
    () =>
      EVENTS.filter((e) => e.exhibitor_ids?.includes(id ?? '')).sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      ),
    [id],
  );

  const handleToggleSave = useCallback(
    (eventId: string) => {
      const event = EVENTS.find((e) => e.id === eventId);
      if (!event) return;
      const willSave = !isSaved(eventId);
      toggleEvent(eventId);
      if (willSave && settings.enabled) {
        scheduleEventNotification(event, settings.leadTime);
      } else {
        cancelEventNotification(eventId);
      }
    },
    [isSaved, toggleEvent, settings, scheduleEventNotification, cancelEventNotification],
  );

  if (!exhibitor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Expositor no encontrado.</Text>
      </View>
    );
  }

  const ListHeader = (
    <View>
      {/* Hero header */}
      <View style={[styles.hero, { backgroundColor: BACColors.navyDark }]}>
        <View style={[styles.heroAvatar, { backgroundColor: BACColors.lightBlue }]}>
          {EXHIBITOR_PHOTOS[exhibitor.id] ? (
            <Image source={EXHIBITOR_PHOTOS[exhibitor.id]} style={styles.heroAvatarImage} resizeMode="cover" />
          ) : (
            <MaterialIcons
              name={exhibitor.exhibitor_type === 'speaker' ? 'person' : 'business'}
              size={48}
              color={BACColors.navyDark}
            />
          )}
        </View>
        <Text style={styles.heroName}>{exhibitor.name}</Text>

        <View style={styles.heroTags}>
          <View style={[styles.typeBadge, { backgroundColor: exhibitor.exhibitor_type === 'speaker' ? BACColors.teal : BACColors.amber }]}>
            <Text style={styles.typeBadgeText}>
              {exhibitor.exhibitor_type === 'speaker' ? 'Ponente' : 'Empresa'}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {exhibitor.description && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Acerca de</Text>
          <Text style={[styles.description, { color: colors.text }]}>{exhibitor.description}</Text>
        </View>
      )}

      {/* Events header */}
      {associatedEvents.length > 0 && (
        <View style={styles.eventsHeader}>
          <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Eventos</Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeader}
      data={associatedEvents}
      keyExtractor={(item) => item.id}
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
      ListEmptyComponent={null}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 20,
    gap: 12,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: 80,
    height: 80,
  },
  heroName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: OrbitronFonts.bold,
    textAlign: 'center',
  },
  heroTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  typeBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  section: { paddingHorizontal: 20, paddingTop: 20, gap: 8 },
  sectionTitle: { fontSize: 11, fontFamily: OrbitronFonts.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 15, lineHeight: 22 },
  eventsHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
});
