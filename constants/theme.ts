import { Platform } from 'react-native';

// BAC 2026 brand palette
export const BACColors = {
  // Primary
  navyDark: '#2C4E61',
  teal: '#1E99AE',
  lightBlue: '#B6E2EB',
  white: '#FFFFFF',
  // Contrast / accent
  amber: '#FFA800',
  peach: '#FFC08C',
  // Semantic
  green: '#4CAF50',
  grey: '#9BA1A6',
  greyLight: '#E8EAEC',
  // Text
  textDark: '#11181C',
  textMedium: '#4A5568',
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
  viveBAC: BACColors.amber,
  businessBAC: BACColors.navyDark,
  other: BACColors.grey,
};

export const Colors = {
  light: {
    text: BACColors.textDark,
    background: '#F5F7FA',
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
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: BACColors.lightBlue,
    border: '#2D3748',
    headerBackground: '#0D1F2B',
  },
};

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
