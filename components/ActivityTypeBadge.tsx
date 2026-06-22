import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityTypeColors } from '@/constants/theme';
import { ActivityType } from '@/types';

interface Props {
  type: ActivityType;
}

export function ActivityTypeBadge({ type }: Props) {
  const bg = ActivityTypeColors[type] ?? '#9BA1A6';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.label}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
