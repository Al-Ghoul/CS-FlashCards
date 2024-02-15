import { atom } from "recoil";
import { Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { db } from "@/utils/firebase.app";

export const KnownCards = atom({
  key: "KnownCardsState",
  default: [] as Array<{ userId: string; cardId: string }>,
  effects: [
    ({ setSelf }) => {
      const currentUser = auth().currentUser;
      const subscriber = db
        .collection("known_cards")
        .where("userId", "==", currentUser?.uid)
        .onSnapshot((knownCards) =>
          setSelf(
            knownCards.docs.map(
              (card) => {
                const { userId, cardId } = card.data();
                return { userId, cardId };
              },
              () => {
                setSelf([]);
                Alert.alert(
                  "Error/Get-KnownCards",
                  "There was an issue fetching known-cards.",
                );
              },
            ),
          )
        );

      return () => subscriber();
    },
  ],
});
