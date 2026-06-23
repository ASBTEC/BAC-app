import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function FeatureBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  return (
    <View style={featureStyles.block}>
      <Text style={[featureStyles.title, { color: BACColors.teal }]}>{title}</Text>
      <Text style={[featureStyles.body, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  block: { gap: 4 },
  title: { fontSize: 13, fontFamily: OrbitronFonts.bold, letterSpacing: 0.3 },
  body: { fontSize: 15, lineHeight: 22 },
});

function B({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: '700' }}>{children}</Text>;
}

export default function AboutScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}>

      {/* About */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: BACColors.navyDark }]}>Acerca de</Text>

        <Text style={[styles.intro, { color: colors.text }]}>
          Aplicación móvil oficial del <B>Congreso Anual de Biotecnología (BAC) 2026</B>, celebrado del{' '}
          <B>7 al 11 de julio</B> en la <B>Facultad de Biociencias de la Universitat Autònoma de Barcelona (UAB)</B>.
        </Text>

        <FeatureBlock title="Programa completo del congreso">
          Consulta todos los eventos: ponencias, talleres, actividades, visitas, mesas redondas y más.
          Para cada evento encontrarás su horario, ubicación dentro o fuera de la sede, ponentes asociados,
          idioma de realización y una descripción detallada.
        </FeatureBlock>

        <FeatureBlock title="Siempre al día">
          La pantalla principal muestra en tiempo real qué está pasando ahora mismo y qué viene a continuación.
          Los eventos se marcan como <B>EN CURSO</B>, <B>PRÓXIMO</B> o <B>PASADO</B> para que no te pierdas nada.
        </FeatureBlock>

        <FeatureBlock title="Busca y filtra a tu medida">
          Filtra los eventos por categoría (<B>BioBAC</B>, <B>BusinessBAC</B>, <B>ExpoBAC</B>, <B>ViveBAC</B>) o busca
          directamente por título, ponente o empresa. También puedes añadir las fechas del congreso a tu
          calendario del dispositivo.
        </FeatureBlock>

        <FeatureBlock title="Mapa interactivo de la sede">
          Navega por el plano interactivo de la Facultad de Biociencias de la UAB. Toca cualquier sala o
          espacio para ver qué eventos se celebran allí en ese momento o a continuación.
        </FeatureBlock>

        <FeatureBlock title="Colaboradores y ponentes">
          Descubre todas las empresas e instituciones colaboradoras y los ponentes del congreso: fotos,
          descripciones y los eventos en los que participan.
        </FeatureBlock>

        <FeatureBlock title="Tu agenda personal">
          Guarda los eventos que te interesan en tu agenda personal y recibe notificaciones antes de que
          empiecen. El tiempo de aviso es configurable (<B>5, 10, 15 o 30 minutos</B>).
        </FeatureBlock>

        <FeatureBlock title="Sin registro. Sin conexión. Sin datos.">
          No necesitas crear ninguna cuenta. Toda la información del congreso está incluida en la aplicación
          y funciona completamente <B>sin conexión a internet</B>. Tu agenda personal se guarda únicamente en
          tu dispositivo — la aplicación <B>no recopila ningún dato personal</B>.
        </FeatureBlock>
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
  intro: {
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
