# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Android release

The Android application ID is `com.rantech_midnight`, matching the app registered in Google Play Console.

Release bundles must use the replacement upload keystore:

- Keystore: `android/upload-keystore.jks`
- Alias: `upload`
- Upload certificate SHA-1: `91:F7:66:5A:AE:A7:A0:00:58:A9:DA:86:5F:77:B1:82:7A:74:91:63`

The replacement upload key becomes valid in Google Play Console on September 6, 2026 at 11:15 UTC. Until then, Google Play will reject bundles signed with this key.

To verify the certificate and build the bundle:

```powershell
Set-Location android
keytool -list -v -keystore .\upload-keystore.jks -alias upload
./gradlew.bat bundleRelease
```

The generated bundle is `android/app/build/outputs/bundle/release/app-release.aab`. Keep `upload-keystore.jks` and its password in a secure backup. Do not commit either the keystore or its password.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
