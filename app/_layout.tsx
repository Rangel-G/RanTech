import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { DashboardProfileProvider } from '@/contexts/dashboard-profile-context';
import { GroupProvider } from '@/contexts/group-context';
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

    // Tratamento assíncrono para evitar requisições não tratadas na inicialização
    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('inset-touch');
      } catch (error) {
        console.warn('Erro ao configurar NavigationBar:', error);
      }
    };

    configureNavigationBar();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GroupProvider>
        <LedProvider>
          <TelemetryProvider>
            <DashboardProfileProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="modal"
                  options={{
                    presentation: 'modal',
                    title: 'Modal',
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="realMap"
                  options={{
                    headerBackTitle: 'Voltar',
                  }}
                />
              </Stack>
              <StatusBar hidden translucent backgroundColor="transparent" />
            </DashboardProfileProvider>
          </TelemetryProvider>
        </LedProvider>
      </GroupProvider>
    </ThemeProvider>
  );
}