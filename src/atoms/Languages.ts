import { atom } from "recoil";
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";


export const Languages = atom({
  key: "Languages",
  default: [] as Array<SelectableItem>,
  effects: [
    ({ setSelf }) => {
      const subscriber = firestore()
        .collection("languages")
        .onSnapshot(languages => setSelf(languages.docs.map(language => {
          const { id, code, fullName } = language.data();
          return ({ id, label: fullName, value: code });
        }, () => {
          setSelf([]);
          Alert.alert("Error/Get-Languages", "There was an issue fetching languages.");
        })));

      return () => subscriber();
    }
  ]
});


export const LanguageFilter = atom({
  key: 'LanguageFilter',
  default: undefined as unknown as SelectableItem,
});
