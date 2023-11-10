import { atom, selector } from "recoil";
import firestore from "@react-native-firebase/firestore";
import { LanguageFilter, Languages } from "./Languages";
import { Alert } from "react-native";

export const TranslatedTopics = atom({
  key: "TranslatedTopicsState",
  default: [] as Array<SelectableTranslatedTopic>,
  effects: [
    ({ setSelf }) => {
      const subscriber = firestore()
        .collection("topic_translations")
        .onSnapshot((topics) =>
          setSelf(
            topics.docs.map(
              (topic) => {
                const { id, name, languageId, topicId } = topic.data();
                return {
                  label: name,
                  value: id,
                  id,
                  data: { languageId, mainTopicId: topicId },
                };
              },
              () => {
                setSelf([]);
                Alert.alert(
                  "Error/Get-TopicsTranslations",
                  "There was an issue fetching topics translations.",
                );
              },
            ),
          ),
        );

      return () => subscriber();
    },
  ],
});

export const FilteredTranslatedTopics = selector({
  key: "FilteredTranslatedTopicsState",
  get: ({ get }) => {
    const languages = get(Languages);
    const filter = get(LanguageFilter) || languages[0]?.value;
    const topics = get(TranslatedTopics);
    const selectedLanguage = languages.filter(
      (language) => language.value === filter.value,
    )[0];

    return topics.filter(
      (topic) => topic.data.languageId === selectedLanguage?.id,
    );
  },
});

