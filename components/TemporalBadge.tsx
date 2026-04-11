import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BACColors } from '@/constants/theme';
import { TemporalStatus } from '@/types';

interface Props {
  status: TemporalStatus;
}

const config: Record<TemporalStatus, { label: string; bg: string; color: string } | null> = {
  now:      { label: 'AHORA',   bg: BACColors.teal,  color: '#fff' },
  upcoming: { label: 'PRÓXIMO', bg: BACColors.amber, color: '#fff' },
  past:     { label: 'PASADO',  bg: BACColors.grey,  color: '#fff' },
  future: null,
};

export function TemporalBadge({ status }: Props) {
  const cfg = config[status];
  if (!cfg) return null;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
