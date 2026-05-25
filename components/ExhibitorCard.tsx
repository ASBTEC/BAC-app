import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getExhibitorPhoto } from '@/constants/exhibitorPhotos';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Exhibitor } from '@/types';

interface Props {
  exhibitor: Exhibitor;
}

export function ExhibitorCard({ exhibitor }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/exhibitor/${exhibitor.id}` as never)}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: BACColors.lightBlue, borderRadius: exhibitor.exhibitor_type === 'business' ? 6 : 24 }]}>
        {getExhibitorPhoto(exhibitor.id, scheme) ? (
          <Image source={getExhibitorPhoto(exhibitor.id, scheme)} style={styles.avatarImage} resizeMode={exhibitor.exhibitor_type === 'business' ? 'contain' : 'cover'} />
        ) : (
          <MaterialIcons
            name={exhibitor.exhibitor_type === 'speaker' ? 'person' : 'business'}
            size={28}
            color={BACColors.navyDark}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {exhibitor.name}
          </Text>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.typeBadge, { backgroundColor: exhibitor.exhibitor_type === 'speaker' ? BACColors.teal + '22' : BACColors.navyDark + '22', borderColor: exhibitor.exhibitor_type === 'speaker' ? BACColors.teal : BACColors.navyDark }]}>
            <Text style={[styles.typeLabel, { color: exhibitor.exhibitor_type === 'speaker' ? BACColors.teal : BACColors.navyDark }]}>
              {exhibitor.exhibitor_type === 'speaker' ? 'Ponente' : 'Empresa'}
            </Text>
          </View>
        </View>

        {exhibitor.description && (
          <Text style={[styles.description, { color: colors.icon }]} numberOfLines={2}>
            {exhibitor.description}
          </Text>
        )}
      </View>

      <MaterialIcons name="chevron-right" size={20} color={colors.icon} style={styles.chevron} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    ...Platform.select({
      native: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.06)' },
    }),
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  typeBadge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  chevron: {
    alignSelf: 'center',
    flexShrink: 0,
  },
});
