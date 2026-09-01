export default {
  expo: {
    name: "RanTech Midnight",
    slug: "rantech_midnight",
    owner: "rangelg",
    version: "1.0.3",
    newArchEnabled: "true",
    icon: "./assets/icon.png",
    orientation: "landscape",
    scheme: "rantechmidnight",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#000000",
      resizeMode: "contain",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rantech.midnight",
      infoPlist: {
        NSBluetoothAlwaysUsageDescription:
          "O aplicativo precisa do Bluetooth para se conectar à Fita LED e ao leitor OBDII.",
        NSBluetoothPeripheralUsageDescription:
          "O aplicativo precisa do Bluetooth para se conectar à Fita LED e ao leitor OBDII.",
      },
    },
    androidStatusBar: {
      hidden: true,
      translucent: true,
    },
    androidNavigationBar: {
      hidden: true,
      visible: false,
      translucent: true,
    },
    plugins: [
      "expo-router",
      [
        "react-native-ble-manager",
        {
          neverForLocation: true,
          bluetoothAlwaysPermission:
            "Permissão para conectar ao dispositivo LED e OBD.",
        },
      ],
      [
        "expo-navigation-bar",
        {
          visibility: "hidden",
          behavior: "inset-touch",
          backgroundColor: "#000000",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/splash.png",
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme:
            "com.googleusercontent.apps.3279657a-969d-43cc-bee1-c6ccf7797e67",
        },
      ],
    ],
    android: {
      useNextNotificationsApi: true,
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#E6F4FE",
      },
      config: {
        googleMaps: {
          apiKey:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
            process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.rantech.midnight",
      permissions: [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },
    web: {
      output: "static",
    },
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "3279657a-969d-43cc-bee1-c6ccf7797e67",
      },
    },
  },
};
