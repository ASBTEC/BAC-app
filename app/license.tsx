import * as Linking from 'expo-linking';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LicenseScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.body, { color: colors.text }]}>
          Esta aplicación es software libre, distribuida bajo los términos de la licencia{' '}
          <Text style={{ fontWeight: '700' }}>GNU General Public License v3 (GPL v3)</Text>.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 12 }]}>
          Esto significa que eres libre de usar, estudiar, modificar y redistribuir esta
          aplicación, siempre que cualquier versión derivada se distribuya bajo la misma
          licencia.
        </Text>
        <Text style={[styles.body, { color: colors.text, marginTop: 12 }]}>
          El código fuente completo está disponible en:
        </Text>
        <Pressable onPress={() => Platform.OS === 'web'
            ? window.open('https://github.com/ASBTEC/BAC-app', '_blank')
            : Linking.openURL('https://github.com/ASBTEC/BAC-app')}>
          <Text style={[styles.link, { color: BACColors.teal }]}>
            github.com/ASBTEC/BAC-app
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
