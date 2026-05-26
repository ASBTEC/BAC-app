import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { LogBox, Platform, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GlobalMenu } from '@/components/GlobalMenu';
import { BACColors, OrbitronFonts } from '@/constants/theme';
import { DataProvider } from '@/context/data-context';
import { ScheduleProvider } from '@/context/schedule-context';
import { ThemeProvider } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { MaterialIcons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

// Silence react-navigation's internal pointerEvents deprecation warning —
// it comes from inside the library and cannot be fixed in our code.
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);
if (Platform.OS === 'web') {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('pointerEvents')) return;
    _warn(...args);
  };
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Orbitron-Regular': require('../assets/fonts/Orbitron-Regular.ttf'),
    'Orbitron-Bold':    require('../assets/fonts/Orbitron-Bold.ttf'),
    'Orbitron-Black':   require('../assets/fonts/Orbitron-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DataProvider>
        <ThemeProvider>
          <ScheduleProvider>
            <RootNavigator />
          </ScheduleProvider>
        </ThemeProvider>
      </DataProvider>
    </GestureHandlerRootView>
  );
}

/** Inner navigator — lives inside ThemeProvider so useColorScheme() is context-aware. */
function RootNavigator() {
  const colorScheme = useColorScheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings, updateSettings } = useNotifications();

  const menuButton = (
    <Pressable hitSlop={12} onPress={() => setMenuOpen(true)}>
      <MaterialIcons name="more-vert" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: BACColors.navyDark },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: OrbitronFonts.bold, fontWeight: '700' },
          headerRight: () => menuButton,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="event/[id]"
          options={{ title: 'Detalles del evento', headerBackTitle: 'Atrás' }}
        />
        <Stack.Screen
          name="exhibitor/[id]"
          options={{ title: 'Expositor', headerBackTitle: 'Atrás' }}
        />
        <Stack.Screen
          name="about"
          options={{ title: 'Acerca de', headerBackTitle: 'Atrás' }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: 'Aviso de privacidad', headerBackTitle: 'Atrás' }}
        />
        <Stack.Screen
          name="license"
          options={{ title: 'Licenciamiento', headerBackTitle: 'Atrás' }}
        />
        <Stack.Screen
          name="support"
          options={{ title: 'Ayuda y soporte', headerBackTitle: 'Atrás' }}
        />
      </Stack>

      <GlobalMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        notificationSettings={settings}
        onUpdateNotifications={updateSettings}
      />

      <StatusBar style="light" />
    </NavThemeProvider>
  );
}
