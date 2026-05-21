import GameContainer from "@/components/GameContainer";
import { useTheme } from "@/contexts/ThemeContext";
import React from "react";
import { View } from "react-native";

export default function Index() {
  const { theme } = useTheme();

  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.background,
    }}>
      <GameContainer />
    </View>
  );
}
