import { Redirect, router } from "expo-router";
import auth from "@react-native-firebase/auth";
import { useEffect } from "react";
import { Drawer } from 'expo-router/drawer';
import { View, Text, Appearance, Pressable } from "react-native";
import { useTheme } from '@react-navigation/native';
import { Button, Divider } from "react-native-paper";
import { Image } from 'expo-image';
import { type DrawerContentComponentProps } from "@react-navigation/drawer";


export default function MainRootLayout() {
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((authedUser) => {
      if (!authedUser) router.push("/sign-in");
    });
    return () => subscriber();
  }, []);

  if (!auth().currentUser) return <Redirect href="/sign-in" />;


  return <Drawer screenOptions={{ headerShown: false }} drawerContent={(props) => <CustomDrawerContent {...props} />} />
}



function CustomDrawerContent({ navigation }: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const currentUser = auth().currentUser;
  const colorScheme = Appearance.getColorScheme();


  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <View style={{ marginTop: 30, marginBottom: 7 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Image
            style={{
              width: 60,
              height: 60,
              backgroundColor: '#0553',
              borderRadius: 30
            }}
            source={currentUser?.photoURL}
          />
          <Text style={{ color: colors.text, alignSelf: "center" }}>{currentUser?.displayName}</Text>
        </View>
        <View style={{ width: "100%", flexDirection: "row", marginTop: 20, justifyContent: "center" }}>
          <Text style={{ color: colors.text, marginRight: 2 }}>Email:</Text>
          <Text style={{ color: colors.text }}>{currentUser?.email}</Text>
        </View>
      </View>
      <Divider />
      <View style={{ width: "100%", marginTop: 20, alignItems: "center" }}>
        <Pressable
          style={{
            width: "50%",
            backgroundColor: colors.primary, alignItems: "center",
            borderRadius: 7, padding: 5, justifyContent: "center",
            borderWidth: 0.5, borderColor: colors.border
          }}
          onPress={() => Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark")}>
          <Text style={{ color: colors.text, fontWeight: "bold" }}>Toggle theme</Text>
        </Pressable>
      </View>
      <Button
        onPress={async () => {
          await auth().signOut();
        }}
        textColor={colors.text}
        buttonColor={colors.primary}
        style={{ marginTop: "auto", width: "60%", alignSelf: "center", margin: 7, borderWidth: 1, borderColor: colors.border }}
      >
        SignOut
      </Button>
    </View>
  );
}