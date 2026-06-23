import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, TrackColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function BiotechTrackBadge({ track }: { track: string }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const trackColor = TrackColors[track] ?? '#9BA1A6';
  return (
    <View style={[styles.badge, { borderColor: trackColor, backgroundColor: trackColor + '33' }]}>
      <View style={[styles.dot, { backgroundColor: trackColor }]} />
      <Text style={[styles.label, { color: colors.text }]}>{track}</Text>
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
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
