import 'expo-dev-client';
import { useState } from 'react';
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from 'expo-web-browser';
import AnimatedAppLoader from 'components/AnimatedAppLoader';
import { ThemeProvider } from '@react-navigation/native';
import { Appearance } from 'react-native';
import { Slot } from 'expo-router';


export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => { });
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  Appearance.addChangeListener((preference) => setColorScheme(preference.colorScheme));


  return (
    <AnimatedAppLoader>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
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