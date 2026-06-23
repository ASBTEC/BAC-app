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
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Agradecimientos</Text>
        <Text style={[styles.ackNote, { color: colors.icon }]}>Ordenado según la importancia de las contribuciones.</Text>

        <View style={styles.ackList}>
          {([
            {
              name: 'Jordi Codinach Simó',
              role: 'Coordinador del área de BusinessBAC del BAC Barcelona 2026',
              contributions: [
                'Idea original de la aplicación',
                'Diseño inicial de la aplicación',
                'Aportación de datos de eventos, colaboradores y ponentes de BusinessBAC',
                'Beta-testing',
              ],
            },
            {
              name: 'Mireia Farré',
              role: 'Colaboradora del área de comunicación del BAC Barcelona 2026',
              contributions: [
                'Diseño de la paleta de colores de la aplicación',
                'Beta-testing',
              ],
            },
            {
              name: 'Meritxell Tardà',
              role: 'Coordinadora del área de informática del BAC Barcelona 2026',
              contributions: ['Beta-testing'],
            },
            {
              name: 'Anna Padilla Figuerola',
              role: 'Autora del vídeo promocional y colaboradora del área de comunicación del BAC Barcelona 2026',
              contributions: ['Beta-testing'],
            },
            {
              name: 'Enrique Vázquez Pereira',
              role: 'Exmiembro de la junta directiva de FEBIOTEC',
              contributions: ['Beta-testing'],
            },
            {
              name: 'Mònica Gutiérrez',
              role: 'Presidenta de la junta directiva de FEBIOTEC',
              contributions: [
                'Diseño de la hoja de cálculo de datos intermedia',
                'Parseo del JSON de datos históricos',
                'Aportación de los datos de colaboradores de FEBIOTEC',
                'Soporte institucional para la publicación en la Apple App Store',
              ],
            },
            {
              name: 'Alba Tomás Sitjes',
              role: 'Coordinadora general del BAC Barcelona 2026',
              contributions: [
                'Coordinación en la creación de la aplicación',
                'Recogida de datos',
                'Compra de herramientas de desarrollo',
              ],
            },
            {
              name: 'Juan Antonio Castro',
              role: 'Coordinador general del BAC Barcelona 2026',
              contributions: [
                'Coordinación en la creación de la aplicación',
                'Recogida de datos',
                'Compra de herramientas de desarrollo',
              ],
            },
            {
              name: 'Joaquim Ventura Calabuig',
              role: 'Coordinador del área de logística del BAC Barcelona 2026',
              contributions: [
                'Diseño del plano de la Facultad de Biociencias de la UAB',
              ],
            },
            {
              name: 'Jaime Serra',
              role: 'Coordinador del área de BioBAC del BAC Barcelona 2026',
              contributions: [
                'Aportación de datos de eventos y ponentes de BioBAC',
              ],
            },
            {
              name: 'Amaia Virgós Vicuña',
              role: 'Coordinadora del área de ExpoBAC del BAC Barcelona 2026',
              contributions: [
                'Aportación de datos de eventos y ponentes de ExpoBAC',
              ],
            },
            {
              name: 'Marc Piqué',
              role: 'Coordinador del área de ViveBAC del BAC Barcelona 2026',
              contributions: [
                'Aportación de datos de eventos y ponentes de ViveBAC',
              ],
            },
            {
              name: 'Geovani Fuentes',
              role: 'Colaborador del área de ViveBAC del BAC Barcelona 2026',
              contributions: [
                'Aportación de datos de eventos y ponentes de ViveBAC',
              ],
            },
            {
              name: 'Carlos Lozano',
              role: 'Colaborador del área de ViveBAC del BAC Barcelona 2026',
              contributions: [
                'Aportación de datos de eventos y ponentes de ViveBAC',
              ],
            },
            {
              name: 'David Álvarez',
              role: 'Director de relaciones institucionales en FEBIOTEC',
              contributions: [
                'Guía y soporte institucional, informático y legal para la publicación en Google Play Store',
              ],
            },
            {
              name: 'Todos los demás colaboradores del BAC',
              role: null,
              contributions: ['Por su trabajo en la organización del congreso; sin ellos esta aplicación no hubiera sido posible'],
            },
          ] as { name: string; role: string | null; contributions: string[] }[]).map(({ name, role, contributions }) => (
            <View key={name} style={[styles.ackEntry, { borderTopColor: colors.border }]}>
              <Text style={[styles.ackName, { color: colors.text }]}>{name}</Text>
              {role && <Text style={[styles.ackRole, { color: colors.icon }]}>{role}</Text>}
              <View style={styles.ackContribs}>
                {contributions.map((c, i) => (
                  <Text key={i} style={[styles.ackContrib, { color: colors.text }]}>• {c}</Text>
                ))}
              </View>
            </View>
          ))}
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
  ackNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -8,
  },
  ackList: {
    gap: 0,
  },
  ackEntry: {
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 3,
  },
  ackName: {
    fontSize: 15,
    fontWeight: '700',
  },
  ackRole: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  ackContribs: {
    marginTop: 4,
    gap: 3,
  },
  ackContrib: {
    fontSize: 14,
    lineHeight: 20,
  },
  linkList: {
    gap: 10,
  },
  linkRow: {},
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
