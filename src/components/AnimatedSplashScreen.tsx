import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";
import Constants from "expo-constants";

export default function AnimatedSplashScreen({ children }: Props) {
  const fadeValue = useSharedValue(1);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().then(() => {
      fadeValue.value = withTiming(0, {
        duration: 1000,
      }, () => runOnJS(setAnimationComplete)(true));
    });
  }, []);

  return (
    <>
      {children}
      {isSplashAnimationComplete == false
        ? (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: Constants.expoConfig?.splash?.backgroundColor,
                opacity: fadeValue,
              },
            ]}
          >
            <Animated.Image
              style={{
                width: "100%",
                height: "100%",
                resizeMode: Constants.expoConfig?.splash?.resizeMode ||
                  "contain",
                transform: [
                  {
                    scale: fadeValue,
                  },
                ],
              }}
              source={require("@/assets/splash/splash.png")}
            />
          </Animated.View>
        )
        : null}
    </>
  );
}

type Props = {
  children: React.ReactNode;
};
