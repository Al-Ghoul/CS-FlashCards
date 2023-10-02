import 'expo-dev-client';
import { Button, View, Text } from 'react-native';
import { styled, useColorScheme } from "nativewind";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useState } from 'react';


const StyledView = styled(View);
const StyledLinearGradient = styled(LinearGradient);

export default function App() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <StyledView
      className="flex-1"
    >
      <StatusBar hidden />
      <StyledLinearGradient
        colors={colorScheme === "dark" ? ["#4B0303", "black"] : ["red", "white"]}
        end={{ x: 0.17, y: .98 }}
        className="flex-1"
      >
        <FlashCard />
      </StyledLinearGradient>
    </StyledView>
  );
}


const FlashCard = () => {
  const offset = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

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
    offset.value = withTiming(offset.value == 0 ? 180 : 0, { duration: 500 }, (isSuccess) => {
      if (isSuccess) runOnJS(setIsFlipped)(!isFlipped);
      runOnJS(setIsHidden)(false);
    });
  }


  return (
    <>
      <Animated.View
        style={
          [{
            flex: 0.3,
            backgroundColor: "black",
            margin: 15,
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "white"
          }, flippingStyle]
        }
      >
        {
          !isHidden ?
            !isFlipped ?
              <Text style={{ alignSelf: "center", color: "white", fontWeight: "600", fontSize: 25 }}>
                What is Hamming Code?
              </Text>
              :
              <Animated.Text style={[{ alignSelf: "center", color: "white" }, contentStyle]}>
                {`int main() {
                  return 5;
                }`}
              </Animated.Text>
            :
            null
        }
      </Animated.View>
      <Button onPress={handlePress} title="Flip Card" />
    </>
  );
}