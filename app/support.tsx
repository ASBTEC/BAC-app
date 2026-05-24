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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Soporte BAC Barcelona 2026</Text>
        <View style={styles.contactRow}>
          <Text style={[styles.label, { color: colors.text }]}>Soporte WhatsApp (09:00–15:00)</Text>
          <Pressable onPress={() => Linking.openURL('https://wa.me/34624820026')}>
            <Text style={[styles.link, { color: BACColors.teal }]}>+34 624 820 026</Text>
          </Pressable>
        </View>
        <View style={styles.contactRow}>
          <Text style={[styles.label, { color: colors.text }]}>Soporte email 24h</Text>
          <Pressable onPress={() => Platform.OS === 'web'
              ? window.open('mailto:contacta.bac2026@febiotec.es', '_blank')
              : Linking.openURL('mailto:contacta.bac2026@febiotec.es')}>
            <Text style={[styles.link, { color: BACColors.teal }]}>
              contacta.bac2026@febiotec.es
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Soporte técnico</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  contactRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
});
