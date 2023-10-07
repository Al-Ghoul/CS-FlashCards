import { Redirect, Stack, router } from "expo-router";
import auth from "@react-native-firebase/auth";
import { useEffect } from "react";

export const unstable_settings = {
  initialRouteName: "welcome",
};

export default function MainRootLayout() {
  const onAuthStateChanged = (authedUser) => {
    if (!authedUser) router.push("/sign-in");
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber();
  }, []);

  if (!auth().currentUser) return <Redirect href="/sign-in" />;

  
  return <Stack screenOptions={{ headerShown: false }} />;
}