import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AboutScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>

      {/* Credits */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Créditos</Text>
        <Text style={[styles.body, { color: colors.text }]}>
          Aplicación desarrollada con amor {'<3'} por{' '}
          <Text style={{ fontWeight: '700' }}>Aleix Mariné-Tena</Text>.
        </Text>
      </View>

      {/* Entidades participantes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Entidades participantes</Text>
        <View style={styles.logosColumn}>
          <View style={styles.logoWrap}>
            <Image source={require('@/assets/images/logo-bac.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.logoWrap}>
            <Image source={require('@/assets/images/logo-asbtec.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <View style={styles.logoWrap}>
            <Image source={require('@/assets/images/logo-febiotec.png')} style={styles.logo} resizeMode="contain" />
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  logosColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  logo: {
    width: 360,
    height: 140,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: OrbitronFonts.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
