import { useEffect, useRef } from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import PagerView from 'react-native-pager-view';
import Constants from 'expo-constants';
import auth from '@react-native-firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, Pressable, Appearance } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FlipInYLeft, FlipOutYLeft } from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';


export default function MainScreen() {
  const colorScheme = Appearance.getColorScheme();
  const { colors } = useTheme();
  const [request, response, promptAsync] = useAuthRequest({
    clientId: process.env.GITHUB_CLIENT_ID,
    scopes: ["identity"],
    redirectUri: makeRedirectUri({
      scheme: "cs-flashcards"
    })
  },
    discovery
  );

  const getAccessTokenAndSignIn = (userCode) => {
    fetch(
      discovery.tokenEndpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET,
          code: userCode,
          redirect_uri: "cs-flashcards://"
        })

      }).then((response) => {
        return response.json();
      }).then(async (data) => {
        const githubCreds = auth.GithubAuthProvider.credential(data.access_token);
        const res = await auth().signInWithCredential(githubCreds);
      }).catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      getAccessTokenAndSignIn(code);
    }
  }, [response]);


  return (
    <LinearGradient
      colors={[colors.background, colors.primary]}
      end={{ x: 0.17, y: .98 }}
      style={{ flex: 1 }}
    >
      <PagerViewSlider />
      <View style={{
        flexDirection: "row", marginBottom: "auto",
        justifyContent: "space-around", alignItems: "center",
        marginTop: 5
      }}>
        <Animated.View entering={FlipInYLeft} exiting={FlipOutYLeft}>
          <Pressable
            disabled={!request}
            onPress={() => promptAsync()}
            style={{
              flexDirection: "row", backgroundColor: colors.primary,
              paddingHorizontal: 10, paddingVertical: 2,
              borderRadius: 7, borderWidth: 0.3, borderColor: colors.border,
              justifyContent: "center",
            }}
          >
            <AntDesign name="github" size={24} color={colors.border} />
            <Text
              style={{ color: colors.text, marginLeft: 5, alignSelf: "center" }}
            >
              SignIn with Github
            </Text>
          </Pressable>
        </Animated.View>
        <Animated.View entering={FlipInYLeft} exiting={FlipOutYLeft}>
          <Pressable
            style={{
              backgroundColor: colors.primary, alignItems: "center",
              borderRadius: 7, padding: 5, justifyContent: "center",
              borderWidth: 0.5, borderColor: colors.border
            }}
            onPress={() => Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark")}>
            <Text style={{ color: colors.text, fontWeight: "bold" }}>Toggle theme</Text>
          </Pressable>
        </Animated.View>

      </View>
    </LinearGradient >
  );
}


function PagerViewSlider() {
  const pageViewerRef = useRef<PagerView>();
  const { colors } = useTheme();

  useEffect(() => {
    var index = 0;
    const intervalId = setInterval(() => { pageViewerRef.current?.setPage(index++ % 2) }, 5 * 1000);
    return () => clearInterval(intervalId);
  }, []);


  return (
    <PagerView
      style={{ width: "90%", height: "33%", alignSelf: "center", marginTop: "auto", marginBottom: 5 }}
      initialPage={0}
      ref={pageViewerRef}
    >
      <View
        style={{ flex: 1, backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.border, justifyContent: "center", paddingHorizontal: 15, borderRadius: 5 }}
        key="1"
      >
        <Text
          style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}
        >
          Hello there!, since I'm still learning and preparing for CS in general;
        </Text>
        <Text
          style={{ color: colors.text, marginTop: 4 }}
        >
          I was looking around and found some great sources, roadmaps and suggestions from variety of devs out there and This app was actually inspired by:</Text>
        <Text
          style={{ color: colors.text, textDecorationLine: "underline", marginTop: 2 }}
          onPress={async () => await WebBrowser.openBrowserAsync("https://github.com/jwasham/computer-science-flash-cards")}
        > Computer Science Flash Cards web by John Washam</Text>
      </View>
      <View
        style={{ flex: 1, backgroundColor: colors.primary, borderWidth: 1, borderColor: colors.border, justifyContent: "center", paddingHorizontal: 15, borderRadius: 5 }}
        key="2"
      >
        <Text
          style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}
        >
          What I actually like about it is that, it reflects UltraLearning's principle no. 5:
        </Text>
        <Text
          style={{ color: colors.text, marginTop: 7, fontSize: 17 }}
        >RETRIEVAL, TEST TO LEARN:</Text>
        <Text
          style={{ color: colors.text, fontWeight: "bold", marginTop: 2 }}
        >"Testing isn't simply a way of assessing knowledge but a way of creating it. Test yourself before you feel confident, and push yourself to actively recall information rather than passively review it."</Text>
        <Text
          style={{ color: colors.text, marginTop: 15, textDecorationLine: "underline" }}
          onPress={async () => await WebBrowser.openBrowserAsync("https://al-ghoul-blog.vercel.app/en/post/2")}> You can read more about UL on my blog.</Text>
      </View>
    </PagerView >
  );
}


const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${Constants.expoConfig.extra.Github.clientId}`,
}