import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { LogBox, Platform, Pressable } from 'react-native';
import 'react-native-reanimated';

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
import { GlobalMenu } from '@/components/GlobalMenu';
import { BACColors, OrbitronFonts } from '@/constants/theme';
import { ScheduleProvider } from '@/context/schedule-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';
import { MaterialIcons } from '@expo/vector-icons';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings, updateSettings } = useNotifications();
  const [fontsLoaded] = useFonts({
    'Orbitron-Regular': require('../assets/fonts/Orbitron-Regular.ttf'),
    'Orbitron-Bold':    require('../assets/fonts/Orbitron-Bold.ttf'),
    'Orbitron-Black':   require('../assets/fonts/Orbitron-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const menuButton = (
    <Pressable hitSlop={12} onPress={() => setMenuOpen(true)}>
      <MaterialIcons name="more-vert" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <ScheduleProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
          options={{ title: 'Event Details', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="exhibitor/[id]"
          options={{ title: 'Exhibitor', headerBackTitle: 'Back' }}
        />
      </Stack>

      <GlobalMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        notificationSettings={settings}
        onUpdateNotifications={updateSettings}
      />

      <StatusBar style="light" />
    </ThemeProvider>
    </ScheduleProvider>
  );
}
