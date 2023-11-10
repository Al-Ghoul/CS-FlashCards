import { LanguageFilter, Languages } from "@/atoms/Languages";
import { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useRecoilState, useRecoilValue } from "recoil";

export const LanguageDropDown = ({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [filterLanguage, setFilterLanguage] = useRecoilState(LanguageFilter);
  const languages = useRecoilValue(Languages);
  const [selectedLanguage, setSelectedLanguage] = useState(
    filterLanguage?.value || languages[0]?.value,
  );

  return (
    <DropDownPicker
      zIndex={2000}
      zIndexInverse={2000}
      open={isPickerOpen}
      setOpen={setIsPickerOpen}
      items={languages}
      value={selectedLanguage}
      setValue={setSelectedLanguage}
      onSelectItem={(item) => setFilterLanguage(item as SelectableItem)}
      style={style}
    />
  );
};
