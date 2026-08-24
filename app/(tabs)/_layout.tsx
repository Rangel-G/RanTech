import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useRef } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const lastTapRef = useRef<number>(0);

  const handleMapsPress = (e: any, propsOnPress?: (e: any) => void) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // Tempo máximo em ms entre os toques

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Duplo clique detectado: aciona o "segredo"
      lastTapRef.current = 0;
      router.push('/realMap');
    } else {
      // Clique simples normal: navega para a aba de mapas padrão
      lastTapRef.current = now;
      if (propsOnPress) {
        propsOnPress(e);
      }
    }
  };

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
          height: 60,
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
          borderRadius: BORDER_RADIUS.xl,
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

      {/* Tab de Mapas com suporte a duplo toque secreto */}
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Mapas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size || 20} color={color} />
          ),
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              onPress={(e) => handleMapsPress(e, props.onPress)}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="datalogger"
        options={{
          title: 'Datalogger',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size || 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="led"
        options={{
          title: 'Fita LED',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" size={size || 20} color={color} />
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