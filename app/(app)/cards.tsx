import LinearGradientView from "@/components/LinearGradientView";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ActivityIndicator, Button, Checkbox } from "react-native-paper";
import { useRecoilValue } from "recoil";
import { LanguageFilter } from "@/atoms/Languages";
import {
  AntDesign,
  Feather,
  Fontisto,
  MaterialIcons,
} from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { LanguageDropDown } from "@/components/LanguageDropDown";
import { TranslatedTopicsDropDown } from "@/components/TranslatedTopicsDropDown";
import { alert } from "@baronha/ting";
import { KnownCards } from "@/atoms/KnownCards";
import { db } from "@/utils/firebase.app";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export default function Cards() {
  const { colors } = useTheme();
  const [lastDocument, setLastDocument] = useState<
    FirebaseFirestoreTypes.DocumentData
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [maxReached, setMaxReached] = useState(false);
  const [cardsData, setCardsData] = useState<Array<CardType>>([]);
  const windowHeight = Dimensions.get("window").height;
  const listRef = useRef<FlatList>(null);
  const QueryLimit = Math.floor(parseInt((windowHeight / 70).toFixed()) * 0.75);
  const [selectedTranslatedTopics, setSelectedTranslatedTopics] = useState<
    Array<string>
  >();
  const selectedLanguage = useRecoilValue(LanguageFilter);
  const userKnownCards = useRecoilValue(KnownCards);
  const [isPublic, setIsPublic] = useState(false);
  const currentUser = auth().currentUser;
  const [isSettingsShown, setIsSettingsShown] = useState(true);
  const offset = useSharedValue(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onModalClose = () => {
    setIsModalVisible(false);
  };
  const [cardIndex, setCardIndex] = useState(0);
  const changedFlag = useRef(false);

  useEffect(() => {
    setCardsData([]);
  }, [selectedTranslatedTopics, selectedLanguage]);

  useEffect(() => {
    setCardIndex(cardsData.length - 1);
  }, [cardsData]);

  useEffect(() => {
    setMaxReached(false);
    setLastDocument(undefined);
  }, [isPublic]);

  function handleDataFetch() {
    if (
      maxReached === true ||
      isLoading === true ||
      !selectedTranslatedTopics?.length ||
      !selectedLanguage
    ) {
      return;
    }

    const cardsCollection = db.collection("cards");
    setIsLoading(true);
    let query = isPublic
      ? cardsCollection
        .where("public", "==", true)
      : cardsCollection
        .where("userId", "==", currentUser?.uid);

    query = query
      .orderBy("createdAt", "asc")
      .where("languageId", "==", selectedLanguage.id)
      .where("mainTopicIds", "array-contains-any", selectedTranslatedTopics);

    if (lastDocument !== undefined) query = query.startAfter(lastDocument);

    let temporaryList: Array<CardType> = [];
    query
      .limit(QueryLimit)
      .get()
      .then((querySnapshot) => {
        setLastDocument(querySnapshot.docs[querySnapshot.docs.length - 1]);
        querySnapshot.docs.forEach(
          (card) => {
            if (
              cardsData.some((data: CardType) => data.id == card.id) ===
                true
            ) {
              setMaxReached(true);
              return;
            }
            temporaryList.push({ ...card.data() as CardType, id: card.id });
          },
          (e) => {
            Alert.alert(
              `Error/FetchCards", "An error occurred fetching cards. ${e}`,
            );
          },
        );

        for (const cardData of userKnownCards) {
          temporaryList = temporaryList.filter(
            (card) => card.id !== cardData.cardId,
          );
        }

        if (temporaryList.length) {
          if (changedFlag.current === true) {
            changedFlag.current = false;
            setCardsData(temporaryList);
          } else {
            setCardsData((currentList) => [...currentList, ...temporaryList]);
          }
        }

        listRef.current?.scrollToEnd();
      })
      .catch((e) => {
        console.log(e);
        Alert.alert(
          `Error/FetchCards", "An error occurred fetching cards. ${e}`,
        );
      })
      .finally(() => setIsLoading(false));
  }

  const rotationStyle = useAnimatedStyle(() => {
    const rotation = interpolate(offset.value, [0, -180], [0, -180], {
      extrapolateRight: Extrapolation.IDENTITY,
    });

    return {
      transform: [{ rotate: rotation + "deg" }],
    };
  });

  return (
    <LinearGradientView>
      <View style={{ flex: 1, marginTop: 20 }}>
        <Animated.View style={[rotationStyle, { marginTop: 20 }]}>
          <Pressable
            style={{ alignSelf: "center" }}
            onPress={() => {
              setIsSettingsShown(!isSettingsShown);
              offset.value = withTiming(offset.value == 0 ? -180 : 0, {
                duration: 500,
              });
            }}
          >
            <Feather name="arrow-down-circle" size={40} color={colors.text} />
          </Pressable>
        </Animated.View>
        {isSettingsShown
          ? (
            <>
              <View style={{ marginTop: 20, gap: 20 }}>
                <LanguageDropDown />
                <TranslatedTopicsDropDown
                  currentValue={selectedTranslatedTopics}
                  setValueFN={setSelectedTranslatedTopics}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <Checkbox
                  status={isPublic ? "checked" : "unchecked"}
                  onPress={() => {
                    setIsPublic(!isPublic);
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

              <Button
                style={{
                  backgroundColor: colors.primary,
                  width: "50%",
                  alignSelf: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                textColor={colors.text}
                onPress={() => {
                  setIsSettingsShown(!isSettingsShown);
                  offset.value = withTiming(offset.value == 0 ? -180 : 0, {
                    duration: 500,
                  });
                  setMaxReached(false);
                  setLastDocument(undefined);
                  changedFlag.current = true;
                  handleDataFetch();
                }}
              >
                Save
              </Button>
            </>
          )
          : null}

        {isLoading
          ? (
            <ActivityIndicator
              size="small"
              style={{ marginVertical: 20 }}
              color={colors.text}
            />
          )
          : null}
        {!cardsData.length && !isLoading
          ? (
            <Text
              style={{
                alignSelf: "center",
                color: colors.text,
                marginTop: 30,
                fontWeight: "bold",
              }}
            >
              No Cards were found with this setting.
            </Text>
          )
          : (
            <FlatList
              contentContainerStyle={{ gap: 15, marginTop: 30 }}
              data={cardsData}
              ref={listRef}
              renderItem={({
                item,
                index,
              }: {
                item: CardType;
                index: number;
              }) => (
                <Pressable
                  style={{ alignItems: "center" }}
                  onPress={() => {
                    setCardIndex(index);
                    setIsModalVisible(true);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: colors.text,
                    }}
                  >
                    {item.cover}
                  </Text>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleDataFetch}
              removeClippedSubviews
            />
          )}
        <CardsModal
          isVisible={isModalVisible}
          onClose={onModalClose}
          cards={cardsData}
          cardIndex={cardIndex}
          fetchNewCards={handleDataFetch}
          setCardIndex={setCardIndex}
        />
      </View>
    </LinearGradientView>
  );
}

function CardsModal({
  isVisible,
  onClose,
  cards,
  cardIndex,
  fetchNewCards,
  setCardIndex,
}: {
  isVisible: boolean;
  onClose: () => void;
  cards: Array<CardType>;
  cardIndex: number;
  fetchNewCards: () => void;
  setCardIndex: (index: number) => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View
        style={{
          height: "85%",
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
            justifyContent: "flex-end",
          }}
        >
          <Pressable onPress={onClose}>
            <MaterialIcons name="close" color={colors.border} size={22} />
          </Pressable>
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <Pressable
            onPress={() => {
              if ((--cardIndex % cards.length) < 0) {
                setCardIndex(
                  cards.length - 1,
                );
              } else setCardIndex(cardIndex % cards.length);
            }}
            style={{ alignSelf: "center" }}
          >
            <AntDesign
              name="left"
              size={24}
              color={colors.text}
              style={{ alignSelf: "center" }}
            />
          </Pressable>

          <FlashCard
            card={cards[cardIndex]}
            style={{
              backgroundColor: colors.primary,
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.border,
              alignSelf: "center",
              width: "90%",
              margin: 15,
              minHeight: 300,
              maxHeight: "80%",
            }}
          />

          <Pressable
            onPress={() => {
              if (++cardIndex === cards.length) fetchNewCards();
              setCardIndex(cardIndex % cards.length);
            }}
            style={{ alignSelf: "center" }}
          >
            <AntDesign
              name="right"
              size={24}
              color={colors.text}
              style={{ alignSelf: "center" }}
            />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const FlashCard = ({
  card,
  style,
}: {
  card: CardType;
  style?: StyleProp<ViewStyle>;
}) => {
  const { colors } = useTheme();
  const offset = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (offset.value === 180) {
      setIsHidden(true);
      offset.value = withTiming(0, { duration: 500 }, (isSuccess) => {
        if (isSuccess) runOnJS(setIsFlipped)(false);
        runOnJS(setIsHidden)(false);
      });
    }
  }, [card]);

  const flippingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateX: offset.value + "deg" }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateX: 180 + "deg" }],
    };
  });

  const handlePress = () => {
    setIsHidden(true);
    offset.value = withTiming(
      offset.value == 0 ? 180 : 0,
      { duration: 500 },
      (isSuccess) => {
        if (isSuccess) runOnJS(setIsFlipped)(!isFlipped);
        runOnJS(setIsHidden)(false);
      },
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Animated.View style={[style, flippingStyle]}>
        {!isHidden
          ? (
            !isFlipped
              ? (
                <Text
                  style={{
                    alignSelf: "center",
                    color: colors.text,
                    fontWeight: "600",
                    fontSize: 25,
                    margin: 3,
                    padding: 5,
                  }}
                >
                  {card.cover}
                </Text>
              )
              : (
                <Animated.ScrollView style={[contentStyle]}>
                  <Text
                    style={{
                      color: colors.text,
                      margin: 3,
                      padding: 5,
                      textAlign: "center",
                    }}
                  >
                    {card.content}
                  </Text>
                </Animated.ScrollView>
              )
          )
          : null}
      </Animated.View>
      <Pressable
        onPress={handlePress}
        style={{ flexDirection: "row", alignSelf: "center", gap: 5 }}
      >
        <Fontisto name="arrow-swap" size={24} color={colors.text} />
        <Text style={{ color: colors.text }}>Flip Card</Text>
      </Pressable>
      <Button
        disabled={isAdding}
        mode="contained"
        textColor={colors.text}
        buttonColor={colors.primary}
        onPress={async () => {
          setIsAdding(true);
          const knownCardsCollection = db.collection("known_cards");
          const currentUser = auth().currentUser;
          const cardsCount = await knownCardsCollection
            .where("userId", "==", currentUser?.uid)
            .where("cardId", "==", card.id)
            .countFromServer()
            .get();
          if (cardsCount.data().count) {
            alert({
              preset: "error",
              message: "Card already exists in your known list",
            });
            setIsAdding(false);
            return;
          } else {
            await knownCardsCollection.add({
              userId: currentUser?.uid,
              cardId: card.id,
            });
            alert({
              message: "Card was added to the known list successfully",
            });
            setIsAdding(false);
          }
        }}
      >
        I Know it
      </Button>
    </View>
  );
};
