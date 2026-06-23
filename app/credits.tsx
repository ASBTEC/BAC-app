import * as Linking from 'expo-linking';
import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreditsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  function openLink(url: string) {
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Linking.openURL(url);
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>

      {/* Credits */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Autor</Text>
        <Text style={[styles.body, { color: colors.text }]}>
          Aplicación desarrollada con amor ❤️ por{' '}
          <Text style={{ fontWeight: '700' }}>Aleix Mariné-Tena</Text>
          {', vocal de informàtica de ASBTEC y coordinador del área de Informática del BAC Barcelona 2026.'}
        </Text>

        <View style={styles.linkList}>
          <Pressable style={styles.linkRow} onPress={() => openLink('mailto:amarine@asbtec.cat')}>
            <Text style={[styles.linkText, { color: BACColors.teal }]}>✉️  amarine@asbtec.cat</Text>
          </Pressable>
          <Pressable style={styles.linkRow} onPress={() => openLink('https://github.com/AleixMT')}>
            <Text style={[styles.linkText, { color: BACColors.teal }]}>🐙  GitHub — @AleixMT</Text>
          </Pressable>
          <Pressable style={styles.linkRow} onPress={() => openLink('https://www.linkedin.com/in/aleixmt/')}>
            <Text style={[styles.linkText, { color: BACColors.teal }]}>💼  LinkedIn — @AleixMT</Text>
          </Pressable>
        </View>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Agradecimientos</Text>

        <View style={styles.linkList}>
          <Text style={[styles.body, { color: colors.text }]}>• Meritxell Tardà, coordinadora del area de comunicacións de BAC Barcelona 2026 </Text>
          <Pressable style={styles.linkRow} onPress={() => openLink('mailto:apadilla@asbtec.cat')}>
            <Text style={[styles.body, { color: colors.text }]}>
              {'• Anna Padilla Figuerola  '}
              <Text style={[styles.linkText, { color: BACColors.teal }]}>✉️ apadilla@asbtec.cat</Text>
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Entidades participantes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Entidades participantes</Text>
        <View style={styles.logosColumn}>
          <Pressable style={styles.logoWrap} onPress={() => openLink('https://bac.febiotec.es/')}>
            <Image source={require('@/assets/images/logo-bac.png')} style={styles.logo} resizeMode="contain" />
          </Pressable>
          <Pressable style={styles.logoWrap} onPress={() => openLink('https://asbtec.cat/')}>
            <Image source={require('@/assets/images/logo-asbtec.png')} style={styles.logo} resizeMode="contain" />
          </Pressable>
          <Pressable style={styles.logoWrap} onPress={() => openLink('https://febiotec.es/')}>
            <Image source={require('@/assets/images/logo-febiotec.png')} style={styles.logo} resizeMode="contain" />
          </Pressable>
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
    gap: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: OrbitronFonts.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
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
  linkList: {
    gap: 10,
  },
  betaTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  linkRow: {},
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
