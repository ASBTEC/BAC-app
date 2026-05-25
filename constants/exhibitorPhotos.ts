export const EXHIBITOR_PHOTOS_THEMED: Record<string, { light: ReturnType<typeof require>; dark: ReturnType<typeof require> }> = {
  'biz_016': {
    light: require('@/assets/images/exhibitors/sponsors/unesco_natcom_esp_flag_spa_W.png'),
    dark: require('@/assets/images/exhibitors/sponsors/unesco_natcom_esp_flag_spa_B.png'),
  },
};

export function getExhibitorPhoto(id: string, scheme: 'light' | 'dark'): ReturnType<typeof require> | undefined {
  if (EXHIBITOR_PHOTOS_THEMED[id]) return EXHIBITOR_PHOTOS_THEMED[id][scheme];
  return EXHIBITOR_PHOTOS[id];
}

export const EXHIBITOR_PHOTOS: Record<string, ReturnType<typeof require>> = {
  // Speakers
  'spk_001': require('@/assets/images/exhibitors/speakers/antonio ferrer montiel.jpg'),
  'spk_002': require('@/assets/images/exhibitors/speakers/Benedetta bolognesi.jpg'),
  'spk_003': require('@/assets/images/exhibitors/speakers/benjamí oller-salvia.jpg'),
  'spk_004': require('@/assets/images/exhibitors/speakers/Juan J. calvete.jpg'),
  'spk_005': require('@/assets/images/exhibitors/speakers/nuria sanchez coll.jpg'),
  'spk_006': require('@/assets/images/exhibitors/speakers/Silvia Osuna.jpg'),
  'spk_010': require('@/assets/images/exhibitors/speakers/Enrique Asin-Garcia.jpg'),
  'spk_011': require('@/assets/images/exhibitors/speakers/Martin Floor.jpg'),
  'spk_012': require('@/assets/images/exhibitors/speakers/francesc godia.jpg'),
  'spk_013': require('@/assets/images/exhibitors/speakers/Elisabet Engel Lopez.jpg'),
  'spk_014': require('@/assets/images/exhibitors/speakers/Marta Cascante.jpg'),
  'spk_015': require('@/assets/images/exhibitors/speakers/albert font ingles.jpg'),
  'spk_016': require('@/assets/images/exhibitors/speakers/ariadna grau.png'),
  'spk_017': require('@/assets/images/exhibitors/speakers/avencia sanchez-mejias.jpg'),
  'spk_018': require('@/assets/images/exhibitors/speakers/cote falaguera.jpg'),
  'spk_019': require('@/assets/images/exhibitors/speakers/estella buscato.png'),
  'spk_020': require('@/assets/images/exhibitors/speakers/gerard caelles.jpg'),
  'spk_021': require('@/assets/images/exhibitors/speakers/joan domingo.png'),
  'spk_022': require('@/assets/images/exhibitors/speakers/jordi ruano.jpg'),
  'spk_023': require('@/assets/images/exhibitors/speakers/jordi xiol.jpg'),
  'spk_024': require('@/assets/images/exhibitors/speakers/laure burtin.jpeg'),
  'spk_025': require('@/assets/images/exhibitors/speakers/luis ruiz-avila.png'),
  'spk_026': require('@/assets/images/exhibitors/speakers/marta figa.jpg'),
  'spk_027': require('@/assets/images/exhibitors/speakers/paqui escoi.png'),
  'spk_028': require('@/assets/images/exhibitors/speakers/julia garcia.jpg'),
  // Sponsors
  'biz_001': require('@/assets/images/exhibitors/sponsors/Farmandome.webp'),
  'biz_002': require('@/assets/images/exhibitors/sponsors/pharmax.png'),
  'biz_003': require('@/assets/images/exhibitors/sponsors/proteintech.png'),
  'biz_004': require('@/assets/images/exhibitors/sponsors/minoryx.png'),
  'biz_005': require('@/assets/images/exhibitors/sponsors/Sartorius-logo.webp'),
  'biz_006': require('@/assets/images/exhibitors/sponsors/udl.png'),
  'biz_007': require('@/assets/images/exhibitors/sponsors/URV-1024x706.webp'),
  'biz_008': require('@/assets/images/exhibitors/sponsors/bepharma.png'),
  'biz_009': require('@/assets/images/exhibitors/sponsors/hipra.jpg'),
  'biz_010': require('@/assets/images/exhibitors/sponsors/splicebio.png'),
  'biz_011': require('@/assets/images/exhibitors/sponsors/uab.png'),
  'biz_012': require('@/assets/images/exhibitors/sponsors/CESIF.png'),
  'biz_013': require('@/assets/images/exhibitors/sponsors/UFV.jpg'),
  'biz_015': require('@/assets/images/exhibitors/sponsors/FarmaLeaders.png'),
};
