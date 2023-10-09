import { Modal, View, Text, Pressable, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { CardInputSchema, CardInputSchemaType } from '@/utils/validators';
import { ActivityIndicator, Button, Checkbox } from 'react-native-paper';
import { useRecoilValue, useSetRecoilState } from "recoil";
import { Languages } from "@/atoms/Languages";
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import AddTopicModal from './AddTopicModal';
import { FilteredTopicsTranslationState, TopicsTranslationFilterState } from '@/atoms/TopicsTranslations';
import firestore from '@react-native-firebase/firestore';
import * as Crypto from 'expo-crypto';
import Toast from 'react-native-simple-toast';
import auth from "@react-native-firebase/auth";

export default function AddCardModal({ isVisible, onClose }: Props) {
  const { colors } = useTheme();
  const languages = useRecoilValue(Languages) as Array<SelectableItem>;
  const topicsTranslations = useRecoilValue(FilteredTopicsTranslationState) as Array<SelectableTopicTranslation>;
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<CardInputSchemaType>({
    resolver: zodResolver(CardInputSchema),
  });
  const [selectedLanguage, setSelectedLanguage] = useState<SelectableItem>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onModalClose = () => {
    setIsModalVisible(false);
  };
  const [selectedTopicTranslation, setSelectedTopicTranslation] = useState<SelectableTopicTranslation>();
  const setFilter = useSetRecoilState(TopicsTranslationFilterState);
  const currentUser = auth().currentUser;
  const [isAddingCard, setIsAddingCard] = useState(false);

  useEffect(() => {
    if (!selectedLanguage) setSelectedLanguage(languages[0]);
  }, [languages]);

  useEffect(() => {
    if (!selectedTopicTranslation) setSelectedTopicTranslation(topicsTranslations[0]);
  }, [topicsTranslations]);


  return (
    <>
      <AddTopicModal isVisible={isModalVisible} onClose={onModalClose} />
      <Modal animationType="slide" transparent={true} visible={isVisible}>
        <View style={{
          height: '75%',
          width: '100%',
          backgroundColor: colors.background,
          borderTopRightRadius: 18,
          borderTopLeftRadius: 18,
          position: 'absolute',
          bottom: 0,
        }}>
          <View style={{
            height: '7%',
            backgroundColor: colors.primary,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Text style={{
              color: colors.border,
              fontSize: 16,
            }}>Add a card</Text>
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
                  style={{ height: 40, borderRadius: 5, borderWidth: 1, backgroundColor: "white", padding: 10 }}
                />
              )}
              name="cover"
            />
            {errors.cover && <Text style={{color: colors.text, alignSelf: "center"}}>{errors.cover.message}</Text>}

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
                  value={value}
                  style={{ height: 40, borderRadius: 5, borderWidth: 1, backgroundColor: "white", padding: 10 }}
                />
              )}
              name="content"
            />
            {errors.content && <Text style={{color: colors.text, alignSelf: "center"}}>{errors.content.message}</Text>}

            <View>
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue) => {
                  // @ts-ignore
                  setFilter(itemValue);
                  setSelectedLanguage(itemValue);
                }}
                mode="dropdown"
                style={{ backgroundColor: "white" }}
              >
                {
                  languages.map(language => <Picker.Item key={language.id} label={language.label} value={language} />)
                }
              </Picker>
              <Entypo name="language" size={24} color={colors.primary} style={[{ position: "absolute", top: 15 }, selectedLanguage?.value === "ar" ? { left: 10 } : { right: 50 }]} />
            </View>

            <View>
              <Picker
                selectedValue={selectedLanguage}
                onValueChange={(itemValue) =>
                  setSelectedTopicTranslation(itemValue as unknown as SelectableTopicTranslation)
                }
                mode="dropdown"
                style={{ backgroundColor: "white" }}
              >
                {
                  topicsTranslations.map(topicTranslation => <Picker.Item key={`${topicTranslation.value.languageId}${topicTranslation.value.mainTopicId}`} label={topicTranslation.label} value={topicTranslation} />)
                }
              </Picker>
              <Pressable
                style={[{ position: "absolute", top: 15 }, selectedLanguage?.value === "ar" ? { left: 10 } : { right: 50 }]}
                onPress={() => {
                  onClose();
                  setIsModalVisible(true);
                }}
              >
                <MaterialCommunityIcons name="tag-plus" size={24} color={colors.primary} />
              </Pressable>
            </View>

            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { value } }) => (
                <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
                  <Checkbox
                    status={value ? "checked" : "unchecked"}
                    onPress={() => {
                      setValue("public", !value);
                    }}
                    color={colors.card}
                  />
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>Public?</Text>
                </View>
              )}
              name="public"
            />
            {errors.public && <Text style={{color: colors.text, alignSelf: "center"}}>{errors.public.message}</Text>}

            <View>
              <Button
                disabled={isAddingCard}
                onPress={handleSubmit((data) => {
                  setIsAddingCard(true);
                  const cardsCollection = firestore().collection("cards");
                  cardsCollection.where("cover", "==", data.cover).count().get()
                    .then(res => {
                      if (!!res.data().count) {
                        Toast.show(`${data.cover} already exists!`, Toast.LONG);
                      } else {
                        const randomUUID = Crypto.randomUUID();
                        cardsCollection.doc()
                          .set({ id: randomUUID, ...data, public: !!data.public, userId: currentUser?.uid, languageId: selectedLanguage?.id, mainTopicId: selectedTopicTranslation?.value.mainTopicId })
                          .then(() => {
                            Toast.show(`${data.cover} was added successfully!`, Toast.LONG);
                          })
                          .catch(e => Alert.alert("Error/AddCard", `There was an error adding card ${e}`));
                      }
                    })
                    .catch(e => Alert.alert("Error/CardsCount", `There was an error counting cards ${e}`))
                    .finally(() => setIsAddingCard(false));
                })}
                style={{ width: "60%", alignSelf: "center", margin: 7, borderWidth: 1, borderColor: colors.border }}
                textColor={colors.text}
              >
                Submit
              </Button>
              {isAddingCard === true ? <ActivityIndicator size={"small"} animating={true} color={"white"} style={{ position: "absolute", left: 140, top: 15 }} /> : null}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}


type Props = {
  isVisible: boolean,
  onClose: () => void
}