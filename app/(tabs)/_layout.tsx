import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/constants/global-styles';
import { useColorScheme } from '@/hooks/use-color-scheme';

const AUTO_HIDE_DELAY = 4000; // 4 segundos de inatividade

function CustomTabBarWrapper(props: BottomTabBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsCollapsed(false);
    timerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, AUTO_HIDE_DELAY);
  }, []);

  // Reinicia o timer ao carregar ou sempre que mudar de aba
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [props.state.index, resetTimer]);

  // Animação para o Footer (desce e esconde)
  const animatedFooterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isCollapsed ? 120 : 0, { duration: 350 }) }],
    opacity: withTiming(isCollapsed ? 0 : 1, { duration: 300 }),
  }));

  // Animação para o Botão "Abas" (sobe e aparece no canto esquerdo)
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(isCollapsed ? 0 : 80, { duration: 350 }) }],
    opacity: withTiming(isCollapsed ? 1 : 0, { duration: 300 }),
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* TabBar Padrão animada */}
      <Animated.View
        style={[styles.tabBarContainer, animatedFooterStyle]}
        pointerEvents={isCollapsed ? 'none' : 'auto'}
        onTouchStart={resetTimer}
      >
        <BottomTabBar {...props} />
      </Animated.View>

      {/* Botão Flutuante "Abas" */}
      <Animated.View
        style={[styles.floatingButtonContainer, animatedButtonStyle]}
        pointerEvents={isCollapsed ? 'auto' : 'none'}
      >
        <Pressable style={styles.floatingButton} onPress={resetTimer}>
          <Ionicons name="grid-outline" size={24} color={COLORS.tabBar.text} />
          <Text style={styles.floatingButtonText}>Tabs</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const lastTapRef = useRef<number>(0);

  const handleMapsPress = (e: any, propsOnPress?: (e: any) => void) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      lastTapRef.current = 0;
      router.push('/realMap');
    } else {
      lastTapRef.current = now;
      if (propsOnPress) {
        propsOnPress(e);
      }
    }
  };

  return (
    <Tabs
      tabBar={(props) => <CustomTabBarWrapper {...props} />}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarContainer: {
    width: '100%',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: SPACING.md || 16,
    left: SPACING.md || 16,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs || 6,
    backgroundColor: COLORS.tabBar.background,
    paddingVertical: SPACING.sm || 10,
    paddingHorizontal: SPACING.md || 16,
    borderRadius: BORDER_RADIUS.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    color: COLORS.tabBar.text,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.heavy,
    textTransform: 'uppercase',
  },
});