import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '@/components/EventCard';
import { getExhibitorPhoto } from '@/constants/exhibitorPhotos';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { useSchedule } from '@/hooks/use-schedule';
import { useData } from '@/context/data-context';
import { Event, Exhibitor } from '@/types';

function getExhibitorsForEvent(event: Event, exhibitors: Exhibitor[]): Exhibitor[] {
  if (!event.exhibitor_ids) return [];
  return event.exhibitor_ids.map((id) => exhibitors.find((e) => e.id === id)).filter(Boolean) as Exhibitor[];
}


export default function ExhibitorDetailScreen() {
  const { events, exhibitors } = useData();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isSaved, toggleEvent } = useSchedule();
  const { settings, scheduleEventNotification, cancelEventNotification } = useNotifications();

  const exhibitor = useMemo(() => exhibitors.find((e) => e.id === id), [exhibitors, id]);

  const associatedEvents = useMemo(
    () =>
      events.filter((e) => e.exhibitor_ids?.includes(id ?? '')).sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      ),
    [events, id],
  );

  const handleToggleSave = useCallback(
    (eventId: string) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;
      const willSave = !isSaved(eventId);
      toggleEvent(eventId);
      if (willSave && settings.enabled) {
        scheduleEventNotification(event, settings.leadTime);
      } else {
        cancelEventNotification(eventId);
      }
    },
    [events, isSaved, toggleEvent, settings, scheduleEventNotification, cancelEventNotification],
  );

  const [photoVisible, setPhotoVisible] = useState(false);

  if (!exhibitor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Expositor no encontrado.</Text>
      </View>
    );
  }
  const photo = getExhibitorPhoto(exhibitor.id, scheme);
  const isBusiness = exhibitor.exhibitor_type === 'business';
  const isImagePhoto = photo && typeof photo !== 'function';

  let heroAvatarContent: React.ReactNode;
  if (photo) {
    if (typeof photo === 'function') {
      const SvgPhoto = photo as React.ComponentType<{ width: number; height: number }>;
      heroAvatarContent = <SvgPhoto width={80} height={80} />;
    } else {
      heroAvatarContent = <Image source={photo} style={styles.heroAvatarImage} resizeMode={isBusiness ? 'contain' : 'cover'} />;
    }
  } else {
    heroAvatarContent = (
      <MaterialIcons
        name={isBusiness ? 'business' : 'person'}
        size={80}
        color={BACColors.navyDark}
      />
    );
  }

  const ListHeader = (
    <View>
      {/* Hero header */}
      <View style={[styles.hero, { backgroundColor: BACColors.navyDark }]}>
        {isImagePhoto ? (
          <Pressable
            style={[styles.heroAvatar, { backgroundColor: '#fff', borderRadius: isBusiness ? 12 : 70 }]}
            onPress={() => setPhotoVisible(true)}>
            {heroAvatarContent}
          </Pressable>
        ) : (
          <View style={[styles.heroAvatar, { backgroundColor: BACColors.lightBlue, borderRadius: isBusiness ? 12 : 70 }]}>
            {heroAvatarContent}
          </View>
        )}
        <Text style={styles.heroName}>{exhibitor.name}</Text>

        <View style={styles.heroTags}>
          <View style={[styles.typeBadge, { backgroundColor: exhibitor.exhibitor_type === 'speaker' ? BACColors.teal : BACColors.amber }]}>
            <Text style={styles.typeBadgeText}>
              {exhibitor.exhibitor_type === 'speaker' ? 'Ponente' : 'Colaborador'}
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
    <>
      <FlatList
        style={{ backgroundColor: colors.background, flex: 1 }}
        contentContainerStyle={styles.content}
        ListHeaderComponent={ListHeader}
        data={associatedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            exhibitors={getExhibitorsForEvent(item, exhibitors)}
            showTemporalLabel={false}
            isSaved={isSaved(item.id)}
            onToggleSave={handleToggleSave}
            dimPast={false}
          />
        )}
        ListEmptyComponent={null}
      />

      {isImagePhoto && (
        <Modal visible={photoVisible} transparent animationType="fade" onRequestClose={() => setPhotoVisible(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPhotoVisible(false)}>
            <Image source={photo} style={styles.modalImage} resizeMode="contain" />
            <View style={styles.modalClose}>
              <MaterialIcons name="close" size={28} color="#fff" />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
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
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroAvatarImage: {
    width: 140,
    height: 140,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalClose: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: BACColors.navyDark,
    borderRadius: 20,
    padding: 6,
  },
});
