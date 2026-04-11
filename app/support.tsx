import * as Linking from 'expo-linking';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupportScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.body, { color: colors.text }]}>
          Para cualquier problema técnico con la aplicación, contacta con el responsable
          informático de ASBTEC.
        </Text>
        <Pressable onPress={() => Platform.OS === 'web'
            ? window.open('mailto:informatica@asbtec.cat', '_blank')
            : Linking.openURL('mailto:informatica@asbtec.cat')}>
          <Text style={[styles.link, { color: BACColors.teal }]}>
            informatica@asbtec.cat
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});
