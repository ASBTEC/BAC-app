import { useContext } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { ThemeContext } from '@/context/theme-context';

/**
 * Returns the active colour scheme, respecting the user's in-app preference
 * (light / dark / system). Falls back to the device scheme if the ThemeProvider
 * is not yet mounted (e.g. during font loading).
 */
export function useColorScheme(): 'light' | 'dark' {
  const ctx = useContext(ThemeContext);
  const deviceScheme = useDeviceColorScheme() ?? 'light';
  return ctx ? ctx.resolvedScheme : deviceScheme;
}
