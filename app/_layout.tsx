import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import 'react-native-reanimated';
import { GlobalMenu } from '@/components/GlobalMenu';
import { BACColors } from '@/constants/theme';
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

  const menuButton = (
    <Pressable hitSlop={12} onPress={() => setMenuOpen(true)}>
      <MaterialIcons name="more-vert" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: BACColors.navyDark },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
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
  );
}
