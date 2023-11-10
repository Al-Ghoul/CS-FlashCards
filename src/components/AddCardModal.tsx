import { Modal, View, Text, Pressable, TextInput, Alert } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardInputSchema, CardInputSchemaType } from "@/utils/validators";
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Divider,
} from "react-native-paper";
import { useRecoilValue } from "recoil";
import { LanguageFilter } from "@/atoms/Languages";
import { useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import AddTopicModal from "./AddTopicModal";
import firestore from "@react-native-firebase/firestore";
import * as Crypto from "expo-crypto";
import auth from "@react-native-firebase/auth";
import { LanguageDropDown } from "./LanguageDropDown";
import { TranslatedTopicsDropDown } from "./TranslatedTopicsDropDown";
import { alert } from "@baronha/ting";

export default function AddCardModal({ isVisible, onClose }: Props) {
  const { colors } = useTheme();
  const currentUser = auth().currentUser;
  const selectedLanguage = useRecoilValue(LanguageFilter);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CardInputSchemaType>({
    resolver: zodResolver(CardInputSchema),
  });
  const [isAddingCard, setIsAddingCard] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const [selectedTranslatedTopics, setSelectedTranslatedTopics] =
    useState<Array<string>>();

  return (
    <>
      <AddTopicModal isVisible={isModalVisible} onClose={onModalClose} />
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
              Add a card
            </Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color={colors.border} size={22} />
            </Pressable>
          </View>
          <View style={{ flex: 1, padding: 5, gap: 5 }}>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Cover"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={{
                    height: 40,
                    borderRadius: 5,
                    borderWidth: 1,
                    backgroundColor: "white",
                    padding: 10,
                  }}
                />
              )}
              name="cover"
            />
            {errors.cover && (
              <Text style={{ color: colors.text, alignSelf: "center" }}>
                {errors.cover.message}
              </Text>
            )}

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Content"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  multiline
                  value={value}
                  style={{
                    minHeight: 40,
                    borderRadius: 5,
                    borderWidth: 1,
                    backgroundColor: "white",
                    padding: 10,
                  }}
                />
              )}
              name="content"
            />
            {errors.content && (
              <Text style={{ color: colors.text, alignSelf: "center" }}>
                {errors.content.message}
              </Text>
            )}

            <LanguageDropDown />

            <TranslatedTopicsDropDown
              currentValue={selectedTranslatedTopics}
              setValueFN={setSelectedTranslatedTopics}
            />

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value } }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "center",
                  }}
                >
                  <Checkbox
                    status={value ? "checked" : "unchecked"}
                    onPress={() => {
                      setValue("public", !value);
                    }}
                    color={colors.card}
                  />
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 20,
                      fontWeight: "bold",
                    }}
                  >
                    Public?
                  </Text>
                </View>
              )}
              name="public"
            />
            {errors.public && (
              <Text style={{ color: colors.text, alignSelf: "center" }}>
                {errors.public.message}
              </Text>
            )}

            <View>
              <Button
                disabled={isAddingCard}
                onPress={handleSubmit((data) => {
                  if (!selectedLanguage) {
                    alert({
                      preset: "error",
                      message: "Please pick a language",
                    });
                    return;
                  }
                  if (!selectedTranslatedTopics) {
                    alert({
                      preset: "error",
                      message: "Please pick at least one topic",
                    });
                    return;
                  }
                  setIsAddingCard(true);
                  const cardsCollection = firestore().collection("cards");
                  cardsCollection
                    .where("cover", "==", data.cover)
                    .count()
                    .get()
                    .then((res) => {
                      if (!!res.data().count) {
                        alert({
                          preset: "error",
                          message: "Card already exists!",
                        });
                      } else {
                        const randomUUID = Crypto.randomUUID();
                        cardsCollection
                          .doc()
                          .set({
                            id: randomUUID,
                            ...data,
                            public: !!data.public,
                            userId: currentUser?.uid,
                            languageId: selectedLanguage?.id,
                            mainTopicIds: selectedTranslatedTopics,
                            createdAt: new Date(),
                          })
                          .then(() => {
                            alert({
                              message: "Card was added successfully!",
                            });
                          })
                          .catch((e) =>
                            Alert.alert(
                              "Error/AddCard",
                              `There was an error adding card ${e}`,
                            ),
                          );
                      }
                    })
                    .catch((e) =>
                      Alert.alert(
                        "Error/CardsCount",
                        `There was an error counting cards ${e}`,
                      ),
                    )
                    .finally(() => setIsAddingCard(false));
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
                Submit
              </Button>
              {isAddingCard === true ? (
                <ActivityIndicator
                  size={"small"}
                  animating={true}
                  color={"white"}
                  style={{ position: "absolute", left: 140, top: 15 }}
                />
              ) : null}
            </View>
          </View>
          <View style={{ height: "35%", gap: 10 }}>
            <Divider style={{ backgroundColor: colors.primary }} bold />
            <Pressable
              onPress={() => {
                onClose();
                setIsModalVisible(true);
              }}
              style={{
                flexDirection: "row",
                alignSelf: "center",
                gap: 7,
                borderWidth: 1,
                borderRadius: 20,
                borderColor: colors.text,
                padding: 5,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>Add a topic</Text>
              <MaterialCommunityIcons
                name="tag-plus"
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

