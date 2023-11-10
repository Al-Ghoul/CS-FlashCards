type CardType = {
  id: string;
  cover: string;
  content: string;
  public: boolean;
  userId: string;
  languageId: string;
  mainTopicId: string;
};

type LanguageType = {
  id: string;
  code: string;
};

type SelectableItem = {
  id: string;
  label: string;
  value: string;
};

type SelectableTranslatedTopic = {
  id: string;
  label: string;
  value: string;
  data: {
    languageId: string;
    mainTopicId: string;
  };
};

type MainTopicType = {
  id: string;
  name: string;
};

type TopicTranslationType = {
  name: string;
  mainTopicId: string;
  languageId: string;
};

type CardType = {
  id: string;
  cover: string;
  content: string;
  public: boolean;
  languageId: string;
  mainTopicId: string;
  userId: string;
};

