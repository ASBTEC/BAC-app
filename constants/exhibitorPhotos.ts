/**
 * Maps the `photo` filename stored in exhibitors.json to the bundled asset.
 * Add a new entry here whenever a new exhibitor photo is added to assets/images/exhibitors/.
 */
export const EXHIBITOR_PHOTOS: Record<string, ReturnType<typeof require>> = {
  'logo-asbtec-squared.jpg': require('@/assets/images/logo-asbtec-squared.jpg'),
};
