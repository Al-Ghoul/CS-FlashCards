import { atom } from "recoil";
import { Alert } from "react-native";
import { db } from "@/utils/firebase.app";

export const Languages = atom({
  key: "LanguagesState",
  default: [] as Array<SelectableItem>,
  effects: [
    ({ setSelf }) => {
      const subscriber = db
        .collection("languages")
        .onSnapshot((languages) =>
          setSelf(languages.docs.map((language) => {
            const { code, fullName } = language.data();
            return ({ id: language.id, label: fullName, value: code });
          }, () => {
            setSelf([]);
            Alert.alert(
              "Error/Get-Languages",
              "There was an issue fetching languages.",
            );
          }))
        );

      return () => subscriber();
    },
  ],
});

export const LanguageFilter = atom({
  key: "LanguageFilterState",
  default: undefined as unknown as SelectableItem,
});
