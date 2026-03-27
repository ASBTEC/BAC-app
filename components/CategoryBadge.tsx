import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CategoryColors } from '@/constants/theme';
import { EventCategory } from '@/types';

const LABELS: Record<EventCategory, string> = {
  viveBAC: 'ViveBAC',
  businessBAC: 'BusinessBAC',
  other: 'Other',
};

interface Props {
  category: EventCategory;
}

export function CategoryBadge({ category }: Props) {
  const bg = CategoryColors[category] ?? '#9BA1A6';
  return (
    <View style={[styles.badge, { backgroundColor: bg + '22', borderColor: bg, borderWidth: 1 }]}>
      <Text style={[styles.label, { color: bg }]}>{LABELS[category]}</Text>
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
    letterSpacing: 0.3,
  },
});
