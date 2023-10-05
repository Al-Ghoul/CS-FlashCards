import 'expo-dev-client';
import { View, Text, Animated, StyleSheet, Pressable } from 'react-native';
import { styled, } from "nativewind";
import { useEffect, useMemo, useState } from 'react';
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import auth from '@react-native-firebase/auth';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';


SplashScreen.preventAutoHideAsync().catch(() => { });
WebBrowser.maybeCompleteAuthSession();
const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: 'https://github.com/settings/connections/applications/Iv1.d9b0c085803e8587',
}
const StyledView = styled(View);


export default function App() {

  return (
    <AnimatedAppLoader>
      <StyledView className='flex-1 bg-red-200' >
      </StyledView>
    </AnimatedAppLoader>
  );
}

function AnimatedAppLoader({ children }) {
  return <AnimatedSplashScreen>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children }) {
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);
  const [user, setUser] = useState();
  const [request, response, promptAsync] = useAuthRequest({
    clientId: "Iv1.d9b0c085803e8587",
    scopes: ["identity"],
    redirectUri: makeRedirectUri({
      scheme: "cs-flashcards"
    })
  },
    discovery);

  const onAuthStateChanged = async (user) => {
    setUser(user);
    if (!isAppReady) {
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber();
  }, []);

  useEffect(() => {
    console.log(request, response);
    if (response?.type === "success") {
      const { code } = response.params;
      console.log(code);
    }
  }, [response]);

  if (!user)
    return (
      <StyledView className="flex-1 justify-center items-center">
        <Pressable onPress={() => promptAsync()}>
          <Text>Login</Text>
        </Pressable>
      </StyledView>
    );

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.expoConfig.splash.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: Constants.expoConfig.splash.resizeMode || "contain",
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={require("./assets/splash.png")}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}