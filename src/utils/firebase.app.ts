import "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";

if (process.env.NODE_ENV === "development") {
  const config = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST!.split(":");
  firestore().useEmulator(config[0], parseInt(config[1]));
}

export const db = firestore();
