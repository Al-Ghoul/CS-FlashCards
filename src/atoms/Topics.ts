import { atom } from "recoil";
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";


export const Topics = atom({
  key: "Topics",
  default: [] as Array<SelectableItem>,
  effects: [
    ({ setSelf }) => {
      const subscriber = firestore()
        .collection("topics")
        .onSnapshot(topics => setSelf(topics.docs.map(topic => {
          const { id, name } = topic.data();
          return ({ id, label: name, value: id });
        }, () => {
          setSelf([]);
          Alert.alert("Error/Get-Topics", "There was an issue fetching topics.");
        })));

      return () => subscriber();
    }
  ]
});