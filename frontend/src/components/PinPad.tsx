import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

const PIN_LENGTH = 6;

interface PinPadProps {
  pin: string;
  onChange: (pin: string) => void;
  onComplete: (pin: string) => void;
  errorSignal?: number;
  showBiometric?: boolean;
  onBiometric?: () => void;
  disabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "del"];

export function PinPad({
  pin,
  onChange,
  onComplete,
  errorSignal = 0,
  showBiometric,
  onBiometric,
  disabled,
}: PinPadProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const shake = useSharedValue(0);

  useEffect(() => {
    if (errorSignal > 0) {
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [errorSignal, shake]);

  const dotsStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const press = (key: string) => {
    if (disabled) return;
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    if (key === "del") {
      onChange(pin.slice(0, -1));
      return;
    }
    if (key === "bio") {
      onBiometric?.();
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + key;
    onChange(next);
    if (next.length === PIN_LENGTH) onComplete(next);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dotsRow, dotsStyle]} testID="pin-dots">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </Animated.View>

      <View style={styles.pad}>
        {KEYS.map((key) => {
          if (key === "bio" && !showBiometric) {
            return <View key={key} style={styles.key} />;
          }
          return (
            <Pressable
              key={key}
              testID={`pin-key-${key}`}
              onPress={() => press(key)}
              disabled={disabled}
              style={({ pressed }) => [styles.key, pressed && key !== "bio" && key !== "del" && styles.keyPressed]}
              accessibilityRole="button"
              accessibilityLabel={key === "del" ? "Delete" : key === "bio" ? "Biometric unlock" : `Digit ${key}`}
            >
              {key === "del" ? (
                <Ionicons name="backspace-outline" size={26} color={colors.onSurface} />
              ) : key === "bio" ? (
                <Ionicons name="finger-print" size={28} color={colors.brandSecondary} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export { PIN_LENGTH };

const useStyles = makeStyles((colors) => ({
  container: { alignItems: "center", gap: 28 },
  dotsRow: { flexDirection: "row", gap: 16 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.onBrandPrimary,
    opacity: 0.6,
  },
  dotFilled: { backgroundColor: colors.onBrandPrimary, opacity: 1 },
  pad: { width: 280, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  keyPressed: { backgroundColor: "rgba(255,255,255,0.3)" },
  keyText: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 28 },
}));
