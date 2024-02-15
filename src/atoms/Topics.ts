import { atom } from "recoil";
import { Alert } from "react-native";
import { db } from "@/utils/firebase.app";

export const Topics = atom({
  key: "Topics",
  default: [] as Array<SelectableItem>,
  effects: [
    ({ setSelf }) => {
      const subscriber = db
        .collection("topics")
        .onSnapshot((topics) =>
          setSelf(topics.docs.map((topic) => {
            const { name } = topic.data();
            const id = topic.id;
            return ({ id, label: name, value: id });
          }, () => {
            setSelf([]);
            Alert.alert(
              "Error/Get-Topics",
              "There was an issue fetching topics.",
            );
          }))
        );

      return () => subscriber();
    },
  ],
});
