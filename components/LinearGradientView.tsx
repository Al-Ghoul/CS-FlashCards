import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';


export default function LinearGradientView({ children }) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.background, colors.primary]}
      end={{ x: 0.17, y: .98 }}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}