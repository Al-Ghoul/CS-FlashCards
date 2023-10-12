import { Pressable, View, Text } from "react-native";
import { useTheme } from '@react-navigation/native';
import LinearGradientView from "@/components/LinearGradientView";
import { Link, useNavigation } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { Button } from "react-native-paper";
import { useState } from "react";
import AddCardModal from "@/components/AddCardModal";


export default function MainScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onModalClose = () => {
    setIsModalVisible(false);
  };


  return (
    <LinearGradientView>
      <AddCardModal isVisible={isModalVisible} onClose={onModalClose} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Button onPress={() => {
          // @ts-ignore
          navigation.openDrawer()
        }}>Open it</Button>
        <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-around" }}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => setIsModalVisible(true)}>
            <Entypo name="circle-with-plus" size={24} color={colors.border} />
            <Text style={{ color: colors.text, marginLeft: 5, fontWeight: "700" }}>Add a card</Text>
          </Pressable>
          <Link href="/cards" asChild>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="card" size={24} color={colors.border} />
              <Text style={{ color: colors.text, marginLeft: 5, fontWeight: "700" }}>Browse Cards</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </LinearGradientView>
  );
}