import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { DashboardProfileProvider } from '@/contexts/dashboard-profile-context';
import { LedProvider } from '@/contexts/led-context';
import { TelemetryProvider } from '@/contexts/telemetryContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('inset-touch');
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LedProvider>
        <TelemetryProvider>
          <DashboardProfileProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen
                name="realMap"
                options={{
                  headerShown: false,
                  headerBackTitle: 'Voltar',
                }}
              />
            </Stack>
            <StatusBar hidden translucent backgroundColor="transparent" />
          </DashboardProfileProvider>
        </TelemetryProvider>
      </LedProvider>
    </ThemeProvider>
  );
}