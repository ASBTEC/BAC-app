import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { GlobalMenu } from '@/components/GlobalMenu';
import { HapticTab } from '@/components/haptic-tab';
import { BACColors, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/use-notifications';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [menuOpen, setMenuOpen] = useState(false);
  const { settings, updateSettings } = useNotifications();

  const menuButton = (
    <Pressable hitSlop={12} onPress={() => setMenuOpen(true)} style={{ marginRight: 16 }}>
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
          headerTitleStyle: { fontWeight: '700' },
          headerRight: () => menuButton,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'My Schedule',
            tabBarLabel: 'Schedule',
            tabBarIcon: ({ color }) => <MaterialIcons name="bookmark" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => <MaterialIcons name="map" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'BAC 2026',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="sponsors"
          options={{
            title: 'Sponsors & Speakers',
            tabBarLabel: 'People',
            tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />,
          }}
        />
      </Tabs>

      <GlobalMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        notificationSettings={settings}
        onUpdateNotifications={updateSettings}
      />
    </>
  );
}
