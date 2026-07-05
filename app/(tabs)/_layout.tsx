import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { GlobalMenu } from '@/components/GlobalMenu';
import { HapticTab } from '@/components/haptic-tab';
import { BACColors, Colors, OrbitronFonts } from '@/constants/theme';
import { GlobalMenuProvider, useGlobalMenu } from '@/context/global-menu-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';

function TabLayoutInner() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { menuOpen, openMenu, closeMenu } = useGlobalMenu();
  const { settings, updateSettings } = useNotifications();

  const menuButton = (
    <Pressable hitSlop={12} onPress={openMenu} style={{ marginRight: 16 }}>
      <MaterialIcons name="more-vert" size={24} color="#fff" />
    </Pressable>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: BACColors.teal,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
            borderTopColor: colors.border,
          },
          headerStyle: { backgroundColor: BACColors.navyDark },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: OrbitronFonts.bold, fontWeight: '700' },
          headerRight: () => menuButton,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Mi Agenda',
            tabBarLabel: 'Agenda',
            tabBarIcon: ({ color }) => <MaterialIcons name="bookmark" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'BAC 2026',
            tabBarLabel: 'Inicio',
            headerShown: false,
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Eventos',
            tabBarIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="sponsors"
          options={{
            title: 'Participantes',
            tabBarLabel: 'Participantes',
            tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
          }}
        />
      </Tabs>

      <GlobalMenu
        visible={menuOpen}
        onClose={closeMenu}
        notificationSettings={settings}
        onUpdateNotifications={updateSettings}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <GlobalMenuProvider>
      <TabLayoutInner />
    </GlobalMenuProvider>
  );
}
