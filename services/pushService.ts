// services/notifications/push-service.ts
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configura como a notificação se comporta se o app estiver aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const PushService = {
  /**
   * Solicita permissão e retorna o token de Push do dispositivo
   */
  async registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!Device.isDevice) {
      console.log("Push Notifications precisam de um dispositivo físico.");
      return undefined;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Falha ao obter permissão para push notification!");
      return undefined;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        // Substitua pelo seu ID do projeto no app.json se for fazer build na EAS
        // projectId: "seu-project-id-aqui"
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#00ffff",
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error("Erro ao pegar push token:", error);
      return undefined;
    }
  },

  /**
   * Envia a notificação para uma lista de tokens
   */
  async sendMeetingPushNotification(
    tokens: string[],
    title: string,
    body: string,
  ) {
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { type: "meeting_invite" },
    }));

    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });
    } catch (error) {
      console.error("Erro ao enviar push API Expo:", error);
    }
  },
};
