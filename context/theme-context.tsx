import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { getItem, setItem } from '@/utils/storage';

const STORAGE_KEY = 'bac_theme_preference';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedScheme: 'light' | 'dark';
  setPreference: (p: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useDeviceColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Hydrate from storage on mount
  useEffect(() => {
    getItem(STORAGE_KEY).then((raw) => {
      if (raw === 'light' || raw === 'dark' || raw === 'system') {
        setPreferenceState(raw);
      }
    });
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    setItem(STORAGE_KEY, p);
  }, []);

  const resolvedScheme: 'light' | 'dark' =
    preference === 'system' ? deviceScheme : preference;

  return (
    <ThemeContext.Provider value={{ preference, resolvedScheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used inside ThemeProvider');
  return ctx;
}
