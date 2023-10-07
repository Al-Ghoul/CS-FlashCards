import 'expo-dev-client';
import { useEffect, useState } from 'react';
import * as SplashScreen from "expo-splash-screen";
import auth from '@react-native-firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import AnimatedAppLoader from 'components/AnimatedAppLoader';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { Appearance } from 'react-native';


SplashScreen.preventAutoHideAsync().catch(() => { });
WebBrowser.maybeCompleteAuthSession();

export default function Layout() {
  const [user, setUser] = useState();
  const onAuthStateChanged = (user) => setUser(user);

  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  Appearance.addChangeListener((preference) => setColorScheme(preference.colorScheme));

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber();
  }, []);


  return (
    <AnimatedAppLoader>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AnimatedAppLoader>
  );
}



const DarkTheme = {
  dark: true,
  colors: {
    primary: "black",
    background: "#4B0303",
    card: "rgb(255, 255, 255)",
    text: "white",
    border: "white",
    notification: "rgb(255, 69, 58)"
  }
}

const DefaultTheme = {
  dark: false,
  colors: {
    primary: "white",
    background: "red",
    card: "rgb(255, 255, 255)",
    text: "black",
    border: "black",
    notification: "rgb(255, 69, 58)"
  }
}