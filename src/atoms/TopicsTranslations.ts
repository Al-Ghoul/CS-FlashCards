import { atom, selector } from "recoil";
import firestore from '@react-native-firebase/firestore';
import { Languages } from "./Languages";
import { Alert } from "react-native";


export const TopicsTranslation = atom({
  key: "TopicsTranslation",
  default: [] as Array<SelectableTopicTranslation>,
  effects: [
    ({ setSelf }) => {
      const subscriber = firestore()
        .collection("topic_translations")
        .onSnapshot(topics => setSelf(topics.docs.map(topic => {
          const { mainTopicId, languageId, name } = topic.data();
          return ({ label: name, value: { mainTopicId, languageId } });
        }, () => {
          setSelf([]);
          Alert.alert("Error/Get-TopicsTranslations", "There was an issue fetching topics translations.")
        })));

      return () => subscriber();
    }
  ]
});


export const TopicsTranslationFilterState = atom({
  key: "TopicsTranslationFilter",
  default: {} as SelectableItem,
});

export const FilteredTopicsTranslationState = selector({
  key: "FilteredTopicsTranslation",
  get: ({ get }) => {
    const languages = get(Languages);
    const filter = get(TopicsTranslationFilterState)?.value || languages[0]?.value;
    const topics = get(TopicsTranslation);
    const selectedLanguage = languages.filter(language => language.value === filter)[0];

    return topics.filter((topic) => topic.value.languageId === selectedLanguage?.id);
  },
});
