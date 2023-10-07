import { ExpoConfig, ConfigContext } from 'expo/config';


export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "CS-FlashCards",
  name: "CS-FlashCards",
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      foregroundImage: "./assets/splash/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.alghoul.csflashcards",
  },
});