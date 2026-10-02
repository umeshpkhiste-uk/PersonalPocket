import { useFonts } from "expo-font";
import { router, Stack, useRootNavigationState, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { PrivacyCover } from "@/src/components/PrivacyCover";
import { ToastProvider } from "@/src/components/Toast";
import { queryClient } from "@/src/query-client";
import { useTheme } from "@/src/theme";
import { useVault, VaultProvider } from "@/src/vault/VaultContext";

LogBox.ignoreAllLogs(true);

// Routes the app between setup / unlock / tabs based on vault status.
function LockGate() {
  const { status } = useVault();
  const segments = useSegments();
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return;
    if (status === "loading") return;

    const root = segments[0];
    const inApp = root === "(tabs)" || root === "detail" || root === "form";

    if (status === "needs_setup" && root !== "setup") {
      router.replace("/setup");
    } else if (status === "locked" && root !== "unlock") {
      router.replace("/unlock");
    } else if (status === "unlocked" && !inApp) {
      router.replace("/(tabs)");
    }
  }, [status, segments, navState?.key]);

  return null;
}

function RootNavigator() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="unlock" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="form" options={{ presentation: "modal" }} />
      </Stack>
      <LockGate />
      <PrivacyCover />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/pjs-400.ttf"),
    "PlusJakartaSans-Medium": require("../assets/fonts/pjs-500.ttf"),
    "PlusJakartaSans-SemiBold": require("../assets/fonts/pjs-600.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/pjs-700.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <VaultProvider>
                <ToastProvider>
                  <StatusBar style="auto" />
                  <RootNavigator />
                </ToastProvider>
              </VaultProvider>
            </KeyboardProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
