import AnimatedSplashScreen from "./AnimatedSplashScreen";

export default function AnimatedAppLoader({ children }: Props) {
  return (
    <AnimatedSplashScreen>
      {children}
    </AnimatedSplashScreen>
  );
}

type Props = {
  children: React.ReactNode;
};
