import * as Linking from 'expo-linking';
import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
          Aplicación desarrollada con amor ❤️ por{' '}
          <Text style={{ fontWeight: '700' }}>Aleix Mariné-Tena</Text>
          {', vocal de informàtica de ASBTEC y coordinador del área de Informática del BAC Barcelona 2026.'}
        </Text>

        <View style={styles.linkList}>
          <Pressable
            style={styles.linkRow}
            onPress={() => {
              const url = 'mailto:amarine@asbtec.cat';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
            <Text style={[styles.linkText, { color: BACColors.teal }]}>
              ✉️  amarine@asbtec.cat
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkRow}
            onPress={() => {
              const url = 'https://github.com/AleixMT';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
            <Text style={[styles.linkText, { color: BACColors.teal }]}>
              🐙  GitHub — @AleixMT
            </Text>
          </Pressable>

          <Pressable
            style={styles.linkRow}
            onPress={() => {
              const url = 'https://www.linkedin.com/in/aleixmt/';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
            <Text style={[styles.linkText, { color: BACColors.teal }]}>
              💼  LinkedIn — @AleixMT
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.betaTitle, { color: colors.text }]}>Beta-testers:</Text>
        <View style={styles.linkList}>
          <Text style={[styles.body, { color: colors.text }]}>• Meritxell Tardà</Text>
          <Pressable
            style={styles.linkRow}
            onPress={() => {
              const url = 'mailto:apadilla@asbtec.cat';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
            <Text style={[styles.body, { color: colors.text }]}>{'• Anna Padilla Figuerola  '}<Text style={[styles.linkText, { color: BACColors.teal }]}>✉️ apadilla@asbtec.cat</Text></Text>
          </Pressable>
        </View>
      </View>

      {/* Entidades participantes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Entidades participantes</Text>
        <View style={styles.logosColumn}>
          <Pressable
            style={styles.logoWrap}
            onPress={() => {
              const url = 'https://bac.febiotec.es/';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
            <Image source={require('@/assets/images/logo-bac.png')} style={styles.logo} resizeMode="contain" />
          </Pressable>
          <Pressable
            style={styles.logoWrap}
            onPress={() => {
              const url = 'https://asbtec.cat/';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
            <Image source={require('@/assets/images/logo-asbtec.png')} style={styles.logo} resizeMode="contain" />
          </Pressable>
          <Pressable
            style={styles.logoWrap}
            onPress={() => {
              const url = 'https://febiotec.es/';
              if (Platform.OS === 'web') {
                window.open(url, '_blank');
              } else {
                Linking.openURL(url);
              }
            }}>
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
  linkList: {
    marginTop: 12,
    gap: 10,
  },
  betaTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  linkRow: {},
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
