import auth from "@react-native-firebase/auth";
import { Text, View } from "react-native";
import { useTheme } from '@react-navigation/native';
import { Button } from "react-native-paper";
import LinearGradientView from "@/LinearGradientView";


export default function MainScreen() {
  const { colors } = useTheme();


  return (
    <LinearGradientView>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.text }}>Welcome {auth().currentUser.displayName}</Text>
        <Button
          onPress={async () => {
            await auth().signOut();
          }}
          textColor={colors.text}
          buttonColor={colors.primary}
          style={{marginTop: 10}}
        >
          SignOut
        </Button>
      </View>
    </LinearGradientView>
  );
}