import { Platform } from 'react-native';

// BAC 2026 brand palette
export const BACColors = {
  // Primary (from official brand guide)
  navyDark: '#2C4E61',
  teal: '#1E99AE',
  lightBlue: '#B6E2EB',
  white: '#FFFFFF',
  // Contrast / accent (from official brand guide)
  amber: '#FFA800',
  peach: '#FFC08C',

  // Teal shades
  tealDark: '#65C8D0',
  tealMid: '#8FE3E5',
  tealLight: '#D0F6F7',

  // Blue shades
  blueDark: '#B6E2EB',   // same as lightBlue
  blueMid: '#D4FAFF',
  blueLight: '#F0FEFF',

  // Navy shades
  navyBase: '#2A4D61',   // close to navyDark
  navyMid: '#457082',
  navyLight: '#679EB2',

  // Amber shades
  amberDark: '#FFA800',  // same as amber
  amberMid: '#FFC152',
  amberLight: '#FFE299',

  // Peach shades
  peachDark: '#FFC08B',  // same as peach
  peachMid: '#FFE2B8',
  peachLight: '#FEFEFE',

  // Semantic (not brand colors — used for UI states)
  green: '#4CAF50',
  grey: '#9BA1A6',
  greyLight: '#F0FEFF',  // was #E8EAEC — swapped to brand blueLight
  // Text
  textDark: '#11181C',
  textMedium: '#457082',  // was #4A5568 — swapped to brand navyMid
  textLight: '#718096',
};

// Activity type color coding (per PRD §12)
export const ActivityTypeColors: Record<string, string> = {
  talk: BACColors.teal,
  round_table: BACColors.navyDark,
  activity: BACColors.amber,
  outdoor_activity: BACColors.green,
  stand: BACColors.grey,
};

// Category color coding (per PRD §12)
export const CategoryColors: Record<string, string> = {
  bioBAC:      '#1C1C1C',   // black & white — matches SVG dark stroke
  businessBAC: '#2C4E62',   // dark blue — matches SVG fill
  expoBAC:     '#368396',   // steel blue — matches SVG fill
  viveBAC:     BACColors.amber,
};

export const Colors = {
  light: {
    text: BACColors.textDark,
    background: BACColors.greyLight,
    card: BACColors.white,
    tint: BACColors.teal,
    icon: BACColors.grey,
    tabIconDefault: BACColors.grey,
    tabIconSelected: BACColors.teal,
    border: BACColors.greyLight,
    headerBackground: BACColors.navyDark,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    card: '#1E2427',
    tint: BACColors.lightBlue,
    icon: BACColors.grey,
    tabIconDefault: BACColors.grey,
    tabIconSelected: BACColors.lightBlue,
    border: '#2D3748',
    headerBackground: '#0D1F2B',
  },
};

// Orbitron — display font for headings and brand text
export const OrbitronFonts = {
  regular: 'Orbitron-Regular',
  bold:    'Orbitron-Bold',
  black:   'Orbitron-Black',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
