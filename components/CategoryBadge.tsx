import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CategoryColors } from '@/constants/theme';
import { EventCategory } from '@/types';
import BioBACLogo      from '../assets/images/event_types/logo biobac_no_text.svg';
import BusinessBACLogo from '../assets/images/event_types/logo businessbac_no_text.svg';
import ExpoBACLogo     from '../assets/images/event_types/logo expobac_no_text.svg';
import ViveBACLogo     from '../assets/images/event_types/logo vivebac_no_text.svg';

const LABELS: Record<EventCategory, string> = {
  bioBAC:      'BioBAC',
  businessBAC: 'BusinessBAC',
  expoBAC:     'ExpoBAC',
  viveBAC:     'ViveBAC',
};

const ICONS: Record<EventCategory, React.FC<{ width?: number; height?: number }>> = {
  bioBAC:      BioBACLogo,
  businessBAC: BusinessBACLogo,
  expoBAC:     ExpoBACLogo,
  viveBAC:     ViveBACLogo,
};

interface Props {
  category: EventCategory;
}

export function CategoryBadge({ category }: Props) {
  const color = CategoryColors[category] ?? '#9BA1A6';
  const Icon = ICONS[category];
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Icon width={12} height={12} />
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
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
