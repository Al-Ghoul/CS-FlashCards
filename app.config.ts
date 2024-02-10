import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "CS-FlashCards",
  name: "CS-FlashCards",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/splash/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/assets/splash/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON
      ? process.env.GOOGLE_SERVICES_JSON
      : "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./src/assets/splash/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.alghoul.csflashcards",
  },
  assetBundlePatterns: [
    "**/*",
  ],
  ios: {
    "supportsTablet": true,
  },
  extra: {
    Github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    eas: {
      projectId: "ebfc1c80-2337-47cf-81a5-66d58db73cf7",
    },
  },
  scheme: "cs-flashcards",
  plugins: [
    "@react-native-firebase/app",
    "expo-router",
  ],
  experiments: {
    "tsconfigPaths": true,
  },
  updates: {
    url: "https://u.expo.dev/ebfc1c80-2337-47cf-81a5-66d58db73cf7",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
});
