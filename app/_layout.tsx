import { ConnectionProvider } from "@/contexts/connectionContext";
import { DashboardProfileProvider } from "@/contexts/dashboard-profile-context";
import { GroupProvider } from "@/contexts/group-context";
import { LedProvider } from "@/contexts/led-context";
import { TelemetryProvider } from "@/contexts/telemetryContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LoggerService } from "@/services/loggerService";
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
    const defaultErrorHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      LoggerService.log("ERROR", `Crash Global (Fatal: ${isFatal})`, {
        message: error?.message,
        stack: error?.stack,
      });

      if (defaultErrorHandler) {
        defaultErrorHandler(error, isFatal);
      }
    });
  }, []);

  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "meeting_invite") {
          router.push("/realMap");
        }
      });

    async function configureUI() {
      if (Platform.OS === "android") {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
        } catch (error) {
          console.warn("Erro ao configurar NavigationBar:", error);
        }
      }
    }

    configureUI();

    return () => {
      responseListener.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ConnectionProvider>
        <TelemetryProvider>
          <GroupProvider>
            <LedProvider>
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
            </LedProvider>
          </GroupProvider>
        </TelemetryProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}