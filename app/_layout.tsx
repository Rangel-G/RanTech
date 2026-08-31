import { ConnectionProvider } from "@/contexts/connectionContext";
import { DashboardProfileProvider } from "@/contexts/dashboard-profile-context";
import { GroupProvider } from "@/contexts/group-context";
import { LedProvider } from "@/contexts/led-context";
import { TelemetryProvider } from "@/contexts/telemetryContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useKeepAwake } from "expo-keep-awake";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

// Configuração global de comportamento das notificações em primeiro/segundo plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useKeepAwake();

  useEffect(() => {
    // Ouvinte global para capturar quando o usuário clica na notificação Push
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        // Se a notificação for um convite de encontro, redireciona para a tela do mapa
        if (data?.type === "meeting_invite") {
          router.push("/realMap");
        }
      });

    async function setupUI() {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.warn("Erro no NavigationBar ignorado na inicialização", error);
      }
    }
    setupUI();

    if (Platform.OS !== "android") return;

    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        console.warn("Erro ao configurar NavigationBar:", error);
      }
    };

    configureNavigationBar();

    return () => {
      responseListener.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ConnectionProvider>
        <GroupProvider>
          <LedProvider>
            <TelemetryProvider>
              <DashboardProfileProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="modal"
                    options={{
                      presentation: "modal",
                      title: "Modal",
                      headerShown: true,
                    }}
                  />
                  <Stack.Screen
                    name="realMap"
                    options={{
                      headerBackTitle: "Voltar",
                    }}
                  />
                </Stack>
                <StatusBar hidden translucent backgroundColor="transparent" />
              </DashboardProfileProvider>
            </TelemetryProvider>
          </LedProvider>
        </GroupProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
