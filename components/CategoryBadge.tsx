import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CategoryColors } from '@/constants/theme';
import { EventCategory } from '@/types';
import BioBACLogo      from '../assets/images/event_types/logo biobac_no_text.svg';
import BusinessBACLogo from '../assets/images/event_types/logo businessbac_no_text.svg';
import ExpoBACLogo     from '../assets/images/event_types/logo expobac_no_text.svg';
import ViveBACLogo     from '../assets/images/event_types/logo vivebac_no_text.svg';

const GeneralIcon: React.FC<{ width?: number; height?: number; color?: string }> = ({ width = 12, height = 12, color }) => (
  <Image
    source={require('../assets/images/android-icon-monochrome.png')}
    style={{ width: Number(width), height: Number(height), tintColor: color as string }}
    resizeMode="contain"
  />
);

const LABELS: Record<EventCategory, string> = {
  bioBAC:      'BioBAC',
  businessBAC: 'BusinessBAC',
  expoBAC:     'ExpoBAC',
  general:     'General',
  viveBAC:     'ViveBAC',
};

const ICONS: Partial<Record<EventCategory, React.FC<{ width?: number; height?: number; color?: string }>>> = {
  bioBAC:      BioBACLogo,
  businessBAC: BusinessBACLogo,
  expoBAC:     ExpoBACLogo,
  viveBAC:     ViveBACLogo,
  general:     GeneralIcon,
};

interface Props {
  category: EventCategory;
}

// Categories that use a solid background with white text/icon instead of a tinted background
const SOLID_CATEGORIES = new Set<EventCategory>(['bioBAC']);

export function CategoryBadge({ category }: Props) {
  const color = CategoryColors[category] ?? '#9BA1A6';
  const Icon = ICONS[category];
  const solid = SOLID_CATEGORIES.has(category);
  const bg = solid ? color : color + '22';
  const fg = solid ? '#fff' : color;
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: color }]}>
      {Icon && <Icon width={12} height={12} color={fg} />}
      <Text style={[styles.label, { color: fg }]}>{LABELS[category]}</Text>
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
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
