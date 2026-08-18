import { Ionicons } from '@expo/vector-icons'; // Import vector icons
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
    
        tabBarButton: HapticTab,
        tabBarActiveTintColor: COLORS.tabBar.text,
        tabBarInactiveTintColor: COLORS.tabBar.inactiveText,
        tabBarActiveBackgroundColor: COLORS.tabBar.active,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar.background,
          borderTopWidth: 0,
          height: 74,
          paddingTop: SPACING.sm,
          paddingBottom: SPACING.sm,
          paddingHorizontal: SPACING.sm,
          borderRadius: BORDER_RADIUS.xl,
          marginHorizontal: 0,
          marginBottom: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          borderRadius: BORDER_RADIUS.lg,
          marginHorizontal: SPACING.xs,
          marginVertical: SPACING.xs,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.sizes.sm,
          fontWeight: TYPOGRAPHY.weights.heavy,
          letterSpacing: TYPOGRAPHY.letterSpacing.widest,
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="datalogger"
        options={{
          title: 'Mapas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Datalogger',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size || 20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}