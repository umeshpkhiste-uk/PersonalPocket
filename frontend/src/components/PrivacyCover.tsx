import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { useVault } from "@/src/vault/VaultContext";

// Covers the screen whenever the app is not active so the OS app-switcher
// snapshot never exposes vault contents.
export function PrivacyCover() {
  const { status } = useVault();
  const styles = useStyles();
  const { colors } = useTheme();
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      setActive(next === "active");
    });
    return () => sub.remove();
  }, []);

  if (active || status !== "unlocked" || Platform.OS === "web") return null;

  return (
    <BlurView intensity={60} tint="light" style={styles.cover} pointerEvents="none" testID="privacy-cover">
      <View style={styles.badge}>
        <Ionicons name="lock-closed" size={30} color={colors.brandPrimary} />
      </View>
      <Text style={styles.text}>PersonalPocket</Text>
    </BlurView>
  );
}

const useStyles = makeStyles((colors) => ({
  cover: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 2000,
    backgroundColor: colors.surface,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 18 },
}));
