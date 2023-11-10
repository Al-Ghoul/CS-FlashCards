import { useEffect, useState } from "react";
import AnimatedSplashScreen from "./AnimatedSplashScreen";


export default function AnimatedAppLoader({ children }: Props) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    setSplashReady(true);
  }, []);

  if (!isSplashReady) {
    return null;
  }

  return (
    <AnimatedSplashScreen>
      {children}
    </AnimatedSplashScreen>
  );
}

type Props = {
  children: React.ReactNode
}