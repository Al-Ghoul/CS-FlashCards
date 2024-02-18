import { FilteredTranslatedTopics } from "@/atoms/TopicsTranslations";
import { useEffect, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useRecoilValue } from "recoil";

export const TranslatedTopicsDropDown = ({
  setValueFN,
  style,
  currentValue,
}: {
  currentValue?: Array<string>;
  setValueFN?: (input: Array<string>) => void;
  style?: StyleProp<ViewStyle>;
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const translatedTopics = useRecoilValue(FilteredTranslatedTopics);
  const [selectedTranslatedTopics, setSelectedTranslatedTopics] = useState(
    currentValue,
  );
  DropDownPicker.setMode("BADGE");

  useEffect(() => {
    if (typeof setValueFN === "function") {
      setValueFN(selectedTranslatedTopics || []);
    }
  }, [selectedTranslatedTopics]);

  return (
    <DropDownPicker
      multiple
      zIndex={isPickerOpen ? 3000 : 1000}
      zIndexInverse={isPickerOpen ? 3000 : 1000}
      open={isPickerOpen}
      setOpen={setIsPickerOpen}
      items={translatedTopics}
      // @ts-ignore types don't match partially
      value={selectedTranslatedTopics}
      setValue={setSelectedTranslatedTopics}
      style={style}
    />
  );
};
