import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityTypeBadge } from '@/components/ActivityTypeBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { TemporalBadge } from '@/components/TemporalBadge';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Event, Exhibitor } from '@/types';
import { formatTimeSlot, getTemporalStatus } from '@/utils/temporal';

interface Props {
  event: Event;
  exhibitors?: Exhibitor[];
  showTemporalLabel?: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  now?: Date;
  dimPast?: boolean;
}

export function EventCard({
  event,
  exhibitors = [],
  showTemporalLabel = false,
  isSaved,
  onToggleSave,
  now = new Date(),
  dimPast = true,
}: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const status = useMemo(() => getTemporalStatus(event, now), [event, now]);
  const isPast = status === 'past';

  const primaryExhibitor = exhibitors[0];

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        isPast && dimPast && styles.dimmed,
      ]}
      onPress={() => router.push(`/event/${event.id}` as never)}>
      {/* Top row: time + temporal badge */}
      <View style={styles.topRow}>
        <Text style={[styles.time, { color: colors.tint }]}>{formatTimeSlot(event.start_time, event.end_time)}</Text>
        <View style={styles.badges}>
          {showTemporalLabel && <TemporalBadge status={status} />}
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {event.title}
      </Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <MaterialIcons name="location-on" size={13} color={colors.icon} />
        <Text style={[styles.location, { color: colors.icon }]}>{event.local_location}</Text>
      </View>

      {/* Primary exhibitor */}
      {primaryExhibitor && (
        <Text style={[styles.exhibitor, { color: BACColors.textMedium }]} numberOfLines={1}>
          {primaryExhibitor.exhibitor_type === 'speaker' ? '🎤 ' : '🏢 '}
          {primaryExhibitor.name}
        </Text>
      )}

      {/* Bottom row: badges + bookmark */}
      <View style={styles.bottomRow}>
        <View style={styles.badgeRow}>
          <ActivityTypeBadge type={event.activity_type} />
          <CategoryBadge category={event.category} />
        </View>
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSave(event.id);
          }}
          style={styles.bookmark}>
          <MaterialIcons
            name={isSaved ? 'bookmark' : 'bookmark-border'}
            size={22}
            color={isSaved ? BACColors.teal : colors.icon}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dimmed: {
    opacity: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
  },
  exhibitor: {
    fontSize: 12,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  bookmark: {
    padding: 2,
  },
});
