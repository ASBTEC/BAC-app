import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '@/context/theme-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * Respects the in-app ThemeContext preference (light / dark / system) when available.
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const ctx = useContext(ThemeContext);
  const deviceScheme = useRNColorScheme() ?? 'light';

  if (!hasHydrated) {
    return 'light';
  }

  return ctx ? ctx.resolvedScheme : deviceScheme;
}
