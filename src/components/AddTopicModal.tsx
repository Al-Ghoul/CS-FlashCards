import { Modal, View, Text, Pressable, TextInput, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MainTopicInputSchema,
  MainTopicTranslationInputSchema,
  MainTopicTranslationInputSchemaType,
} from "@/utils/validators";
import { Button } from "react-native-paper";
import { useRecoilState, useRecoilValue } from "recoil";
import { LanguageFilter, Languages } from "@/atoms/Languages";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Entypo, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Topics } from "@/atoms/Topics";
import * as Crypto from "expo-crypto";
import firestore from "@react-native-firebase/firestore";
import { ActivityIndicator } from "react-native-paper";
import { alert } from "@baronha/ting";

export default function AddTopicModal({ isVisible, onClose }: Props) {
  const { colors } = useTheme();
  const languages = useRecoilValue(Languages) as Array<SelectableItem>;
  const topics = useRecoilValue(Topics) as Array<SelectableItem>;
  const {
    control,
    handleSubmit: handleTopicSubmit,
    formState: { errors },
  } = useForm<MainTopicType>({
    resolver: zodResolver(MainTopicInputSchema),
  });
  const {
    control: handleSubmitTranslationControl,
    handleSubmit: handleTopicTranslationSubmit,
    formState: { errors: TopicTranslationErrors },
  } = useForm<MainTopicTranslationInputSchemaType>({
    resolver: zodResolver(MainTopicTranslationInputSchema),
  });
  const [selectedLanguage, setSelectedLanguage] =
    useRecoilState(LanguageFilter);
  const [selectedTopic, setSelectedTopic] = useState<SelectableItem>(topics[0]);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isAddingTopicTranslation, setIsAddingTopicTranslation] =
    useState(false);

  useEffect(() => {
    if (!selectedLanguage) setSelectedLanguage(languages[0]);
  }, [languages]);

  useEffect(() => {
    setSelectedTopic(topics[0]);
  }, [topics]);

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View
        style={{
          height: "75%",
          width: "100%",
          backgroundColor: colors.background,
          borderTopRightRadius: 18,
          borderTopLeftRadius: 18,
          position: "absolute",
          bottom: 0,
        }}
      >
        <View
          style={{
            height: "7%",
            backgroundColor: colors.primary,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              color: colors.border,
              fontSize: 16,
            }}
          >
            Add a topic
          </Text>
          <Pressable onPress={onClose}>
            <MaterialIcons name="close" color={colors.border} size={22} />
          </Pressable>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Topic Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={{
                  height: 40,
                  borderRadius: 5,
                  borderWidth: 1,
                  backgroundColor: "white",
                  padding: 10,
                  margin: 5,
                }}
              />
            )}
            name="name"
          />
          {errors.name && (
            <Text style={{ color: colors.text, alignSelf: "center" }}>
              {errors.name.message}
            </Text>
          )}

          <View>
            <Button
              disabled={isAddingTopic}
              onPress={handleTopicSubmit((data) => {
                setIsAddingTopic(true);
                const topicsCollection = firestore().collection("topics");
                topicsCollection
                  .where("name", "==", data.name)
                  .count()
                  .get()
                  .then((res) => {
                    if (!!res.data().count) {
                      alert({
                        preset: "error",
                        message: "Card already exists",
                      });
                    } else {
                      const randomUUID = Crypto.randomUUID();
                      topicsCollection
                        .doc()
                        .set({ ...data, id: randomUUID })
                        .then(() => {
                          alert({
                            message: "Card was added successfully!",
                          });
                        })
                        .catch((e) =>
                          Alert.alert(
                            "Error/AddTopic",
                            `There was an error adding topic ${e}`,
                          ),
                        );
                    }
                  })
                  .catch((e) =>
                    Alert.alert(
                      "Error/TopicsCount",
                      `There was an error counting topics ${e}`,
                    ),
                  )
                  .finally(() => setIsAddingTopic(false));
              })}
              style={{
                width: "60%",
                alignSelf: "center",
                margin: 7,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              textColor={colors.text}
            >
              Add Topic
            </Button>
            {isAddingTopic === true ? (
              <ActivityIndicator
                size={"small"}
                animating={true}
                color={"white"}
                style={{ position: "absolute", left: 140, top: 15 }}
              />
            ) : null}
          </View>
          <View
            style={{
              height: "7%",
              backgroundColor: colors.primary,
              borderBottomWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderTopRightRadius: 18,
              borderTopLeftRadius: 18,
              marginTop: 5,
            }}
          >
            <Text
              style={{
                color: colors.border,
                fontSize: 16,
              }}
            >
              Add a topic translation
            </Text>
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Controller
              control={handleSubmitTranslationControl}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Topic Name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={{
                    height: 40,
                    borderRadius: 5,
                    borderWidth: 1,
                    backgroundColor: "white",
                    padding: 10,
                    margin: 5,
                  }}
                />
              )}
              name="name"
            />
            {TopicTranslationErrors.name && (
              <Text style={{ color: colors.text, alignSelf: "center" }}>
                {TopicTranslationErrors.name.message}
              </Text>
            )}
            <View style={{ marginHorizontal: 5 }}>
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                mode="dropdown"
                style={{ backgroundColor: "white" }}
              >
                {languages.map((language) => (
                  <Picker.Item
                    key={language.id}
                    label={language.label}
                    value={language}
                  />
                ))}
              </Picker>
              <Entypo
                name="language"
                size={24}
                color={colors.primary}
                style={[
                  { position: "absolute", top: 15 },
                  selectedLanguage?.value === "ar"
                    ? { left: 10 }
                    : { right: 50 },
                ]}
              />
            </View>

            <View style={{ marginHorizontal: 5 }}>
              <Picker
                selectedValue={selectedTopic}
                onValueChange={(itemValue) => setSelectedTopic(itemValue)}
                mode="dropdown"
                style={{ backgroundColor: "white" }}
              >
                {topics.map((topic) => (
                  <Picker.Item
                    key={topic.id}
                    label={topic.label}
                    value={topic}
                  />
                ))}
              </Picker>

              <AntDesign
                name="tags"
                size={24}
                color={colors.primary}
                style={{ position: "absolute", top: 15, right: 50 }}
              />
            </View>

            <View>
              <Button
                disabled={isAddingTopicTranslation}
                onPress={handleTopicTranslationSubmit((data) => {
                  setIsAddingTopicTranslation(true);
                  const topicTranslationsCollection =
                    firestore().collection("topic_translations");
                  topicTranslationsCollection
                    .where("name", "==", data.name)
                    .count()
                    .get()
                    .then((res) => {
                      if (!!res.data().count) {
                        alert({
                          preset: "error",
                          message: "Card already exists!",
                        });
                      } else {
                        topicTranslationsCollection
                          .doc()
                          .set({
                            ...data,
                            mainTopicId: selectedTopic?.id,
                            languageId: selectedLanguage?.id,
                          })
                          .then(() => {
                            setIsAddingTopic(false);
                            alert({ message: "Card was added successfully"});
                          })
                          .catch((e) =>
                            Alert.alert(
                              "Error/AddTopicTranslation",
                              `There was an error adding topic translation ${e}`,
                            ),
                          );
                      }
                    })
                    .catch((e) =>
                      Alert.alert(
                        "Error/TopicsTranslationsCount",
                        `There was an error counting topics translations ${e}`,
                      ),
                    )
                    .finally(() => setIsAddingTopicTranslation(false));
                })}
                style={{
                  width: "60%",
                  alignSelf: "center",
                  margin: 7,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                textColor={colors.text}
              >
                Add Topic Translation
              </Button>
              {isAddingTopicTranslation === true ? (
                <ActivityIndicator
                  size={"small"}
                  animating={true}
                  color={"white"}
                  style={{ position: "absolute", left: 110, top: 15 }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

