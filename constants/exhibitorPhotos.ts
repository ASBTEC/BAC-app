/**
 * Maps the `photo` filename stored in exhibitors.json to the bundled asset.
 * Add a new entry here whenever a new exhibitor photo is added to assets/images/exhibitors/.
 */
export const EXHIBITOR_PHOTOS: Record<string, ReturnType<typeof require>> = {
  // Speakers
  'antonio ferrer montiel.png': require('@/assets/images/exhibitors/speakers/antonio ferrer montiel.png'),
  'Benedetta bolognesi.png': require('@/assets/images/exhibitors/speakers/Benedetta bolognesi.png'),
  'benjamí oller-salvia.png': require('@/assets/images/exhibitors/speakers/benjamí oller-salvia.png'),
  'Juan J. calvete.png': require('@/assets/images/exhibitors/speakers/Juan J. calvete.png'),
  'nuria sanchez coll.png': require('@/assets/images/exhibitors/speakers/nuria sanchez coll.png'),
  'sílvia osuna.png': require('@/assets/images/exhibitors/speakers/sílvia osuna.png'),
  // Sponsors
  'Farmandome.webp': require('@/assets/images/exhibitors/sponsors/Farmandome.webp'),
  'logo-pharmaX.webp': require('@/assets/images/exhibitors/sponsors/logo-pharmaX.webp'),
  'logo-proteintech.webp': require('@/assets/images/exhibitors/sponsors/logo-proteintech.webp'),
  'Minoryx.webp': require('@/assets/images/exhibitors/sponsors/Minoryx.webp'),
  'Sartorius-logo.webp': require('@/assets/images/exhibitors/sponsors/Sartorius-logo.webp'),
  'UdL.webp': require('@/assets/images/exhibitors/sponsors/UdL.webp'),
  'URV-1024x706.webp': require('@/assets/images/exhibitors/sponsors/URV-1024x706.webp'),
};
