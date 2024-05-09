import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Appearance, Pressable, Text, View } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { createRef, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import LinearGradientView from "@/components/LinearGradientView";
import { router } from "expo-router";
import Animated, {
  FlipInYLeft,
  FlipInYRight,
  FlipOutYLeft,
  FlipOutYRight,
} from "react-native-reanimated";
import PagerView from "react-native-pager-view";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

export default function SingInScreen() {
  const colorScheme = Appearance.getColorScheme();
  const { colors } = useTheme();
  const [request, response, promptAsync] = useAuthRequest({
    clientId: Constants.expoConfig?.extra?.Github.clientId,
    scopes: ["identity"],
    redirectUri: makeRedirectUri({
      scheme: "cs-flashcards",
      path: "sign-in",
    }),
  }, discovery);
  const getAccessTokenAndSignIn = (userCode: string) => {
    fetch(
      discovery.tokenEndpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          client_id: Constants.expoConfig?.extra?.Github.clientId,
          client_secret: Constants.expoConfig?.extra?.Github.clientSecret,
          code: userCode,
          redirect_uri: "cs-flashcards://sign-in",
        }),
      },
    ).then((response) => {
      return response.json();
    }).then((data) => {
      const githubCreds = auth.GithubAuthProvider.credential(data.access_token);
      auth().signInWithCredential(githubCreds).then(() => {
        router.replace("/");
      });
    }).catch((err) => {
      console.log(err);
    });
  };

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      getAccessTokenAndSignIn(code);
    }
  }, [response]);

  return (
    <LinearGradientView>
      <LinearGradientView>
        <PagerViewSlider />
        <View
          style={{
            flexDirection: "row",
            marginBottom: "auto",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <Animated.View entering={FlipInYLeft} exiting={FlipOutYLeft}>
            <Pressable
              disabled={!request}
              onPress={() => promptAsync()}
              style={{
                flexDirection: "row",
                backgroundColor: colors.primary,
                paddingHorizontal: 10,
                paddingVertical: 2,
                borderRadius: 7,
                borderWidth: 0.3,
                borderColor: colors.border,
                justifyContent: "center",
                alignSelf: "center",
                marginTop: "auto",
                marginBottom: "auto",
              }}
            >
              <AntDesign name="github" size={24} color={colors.border} />
              <Text
                style={{
                  color: colors.text,
                  marginLeft: 5,
                  alignSelf: "center",
                }}
              >
                SignIn with Github
              </Text>
            </Pressable>
          </Animated.View>
          <Animated.View entering={FlipInYRight} exiting={FlipOutYRight}>
            <Pressable
              style={{
                backgroundColor: colors.primary,
                alignItems: "center",
                borderRadius: 7,
                padding: 5,
                justifyContent: "center",
                borderWidth: 0.5,
                borderColor: colors.border,
              }}
              onPress={() =>
                Appearance.setColorScheme(
                  colorScheme === "dark" ? "light" : "dark",
                )}
            >
              <Text style={{ color: colors.text, fontWeight: "bold" }}>
                Toggle theme
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradientView>
    </LinearGradientView>
  );
}

function PagerViewSlider() {
  const pageViewerRef = createRef<PagerView>();
  const { colors } = useTheme();

  useEffect(() => {
    let idx = 0;
    const intervalId = setInterval(() => {
      pageViewerRef.current?.setPage(++idx % 2);
    }, 2 * 1000);
    return () => clearInterval(intervalId);
  }, [pageViewerRef.current]);

  return (
    <PagerView
      style={{
        width: "90%",
        height: "33%",
        alignSelf: "center",
        marginTop: "auto",
        marginBottom: 5,
      }}
      initialPage={0}
      ref={pageViewerRef}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          paddingHorizontal: 15,
          borderRadius: 5,
        }}
        key="1"
      >
        <Text
          style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}
        >
          Hello there!, since I'm still learning and preparing for CS in
          general;
        </Text>
        <Text
          style={{ color: colors.text, marginTop: 4 }}
        >
          I was looking around and found some great sources, roadmaps and
          suggestions from variety of devs out there and This app was actually
          inspired by:
        </Text>
        <Text
          style={{
            color: colors.text,
            textDecorationLine: "underline",
            marginTop: 2,
          }}
          onPress={async () =>
            await WebBrowser.openBrowserAsync(
              "https://github.com/jwasham/computer-science-flash-cards",
            )}
        >
          Computer Science Flash Cards web by John Washam
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          paddingHorizontal: 15,
          borderRadius: 5,
        }}
        key="2"
      >
        <Text
          style={{ color: colors.text, fontWeight: "500", fontSize: 15 }}
        >
          What I actually like about it is that, it reflects UltraLearning's
          principle no. 5:
        </Text>
        <Text
          style={{ color: colors.text, marginTop: 7, fontSize: 17 }}
        >
          RETRIEVAL, TEST TO LEARN:
        </Text>
        <Text
          style={{ color: colors.text, fontWeight: "bold", marginTop: 2 }}
        >
          "Testing isn't simply a way of assessing knowledge but a way of
          creating it. Test yourself before you feel confident, and push
          yourself to actively recall information rather than passively review
          it."
        </Text>
        <Text
          style={{
            color: colors.text,
            marginTop: 15,
            textDecorationLine: "underline",
          }}
          onPress={async () => await WebBrowser.openBrowserAsync(
            "https://al-ghoul-blog.vercel.app/en/post/2",
          )}
        >
          You can read more about UL on my blog.
        </Text>
      </View>
    </PagerView>
  );
}

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    `https://github.com/settings/connections/applications/${Constants.expoConfig?.extra?.Github.clientId}`,
};
