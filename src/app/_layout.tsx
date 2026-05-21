import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function ThemedStatusBar() {
  const { themeMode } = useTheme();
  return <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedStatusBar />
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarStyle: "auto",
          statusBarBackgroundColor: "transparent",
        }}
      />
    </ThemeProvider>
  );
}
