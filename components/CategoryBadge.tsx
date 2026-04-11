import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CategoryColors } from '@/constants/theme';
import { EventCategory } from '@/types';

const LABELS: Record<EventCategory, string> = {
  bioBAC:      'BioBAC',
  businessBAC: 'BusinessBAC',
  expoBAC:     'ExpoBAC',
  viveBAC:     'ViveBAC',
};

const ICONS: Record<EventCategory, ReturnType<typeof require>> = {
  bioBAC:      require('../assets/images/event_types/bioBAC.png'),
  businessBAC: require('../assets/images/event_types/businessBAC.png'),
  expoBAC:     require('../assets/images/event_types/expoBAC.png'),
  viveBAC:     require('../assets/images/event_types/viveBAC.png'),
};

interface Props {
  category: EventCategory;
}

export function CategoryBadge({ category }: Props) {
  const color = CategoryColors[category] ?? '#9BA1A6';
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Image source={ICONS[category]} style={styles.icon} />
      <Text style={[styles.label, { color }]}>{LABELS[category]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  icon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
