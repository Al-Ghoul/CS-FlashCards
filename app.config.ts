import { ExpoConfig, ConfigContext } from 'expo/config';


export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "CS-FlashCards",
  name: "CS-FlashCards",
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      foregroundImage: "./src/assets/splash/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.alghoul.csflashcards",
  },
  extra: {
    Github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    eas: {
      projectId: "ebfc1c80-2337-47cf-81a5-66d58db73cf7"
    }
  }
});