import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinPad } from "@/src/components/PinPad";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { useVault } from "@/src/vault/VaultContext";

export default function Unlock() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { unlockWithPin, unlockWithBiometric, settings, biometricAvailable } = useVault();

  const [pin, setPin] = useState("");
  const [errorSignal, setErrorSignal] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bioTried = useRef(false);

  const showBiometric = settings.biometricEnabled && biometricAvailable;

  const runBiometric = async () => {
    const ok = await unlockWithBiometric();
    if (!ok) setError("");
  };

  useEffect(() => {
    if (showBiometric && !bioTried.current) {
      bioTried.current = true;
      runBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBiometric]);

  const onComplete = async (entered: string) => {
    setBusy(true);
    const ok = await unlockWithPin(entered);
    setBusy(false);
    if (!ok) {
      setErrorSignal((n) => n + 1);
      setError("Incorrect PIN. Try again.");
      setPin("");
    }
  };

  return (
    <LinearGradient colors={[colors.brandSecondary, colors.brandPrimary, colors.surfaceInverse]} style={styles.bg}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + 48 }]}>
        <View style={styles.logo}>
          <Ionicons name="lock-closed" size={34} color={colors.onBrandPrimary} />
        </View>
        <Text style={styles.brand}>PersonalPocket</Text>
        <Text style={styles.title}>Enter your PIN</Text>
        <Text style={styles.subtitle}>Your vault is locked for your privacy.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        {busy ? (
          <ActivityIndicator color={colors.onBrandPrimary} style={{ height: 300 }} />
        ) : (
          <PinPad
            pin={pin}
            onChange={setPin}
            onComplete={onComplete}
            errorSignal={errorSignal}
            showBiometric={showBiometric}
            onBiometric={runBiometric}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const useStyles = makeStyles((colors) => ({
  bg: { flex: 1, justifyContent: "space-between" },
  top: { alignItems: "center", paddingHorizontal: 32, gap: 6 },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  brand: { color: colors.onBrandPrimary, fontFamily: fonts.bold, fontSize: 22 },
  title: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 18, marginTop: 16 },
  subtitle: { color: "rgba(255,255,255,0.8)", fontFamily: fonts.regular, fontSize: 14, textAlign: "center" },
  error: { color: "#FFD4D4", fontFamily: fonts.medium, fontSize: 13, marginTop: 10 },
  bottom: { alignItems: "center" },
}));
