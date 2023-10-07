import { ExpoConfig, ConfigContext } from 'expo/config';


export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: "CS-FC",
  name: "CS-FlashCards",
  android: {
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
  },
});