import { Ionicons } from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PIN_LENGTH, PinPad } from "@/src/components/PinPad";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { useVault } from "@/src/vault/VaultContext";

export default function Setup() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { setupPin } = useVault();

  const [step, setStep] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [errorSignal, setErrorSignal] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onComplete = async (entered: string) => {
    if (step === "create") {
      setFirstPin(entered);
      setPin("");
      setStep("confirm");
      setError("");
      return;
    }
    if (entered !== firstPin) {
      setErrorSignal((n) => n + 1);
      setError("PINs did not match. Try again.");
      setPin("");
      setStep("create");
      setFirstPin("");
      return;
    }
    setBusy(true);
    try {
      await setupPin(entered);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={[colors.brandSecondary, colors.brandPrimary, colors.surfaceInverse]} style={styles.bg}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + 36 }]}>
        <View style={styles.logo}>
          <Ionicons name="shield-checkmark" size={34} color={colors.onBrandPrimary} />
        </View>
        <Text style={styles.brand}>PersonalPocket</Text>
        <Text style={styles.title}>{step === "create" ? "Create your PIN" : "Confirm your PIN"}</Text>
        <Text style={styles.subtitle}>
          {step === "create"
            ? "Set a 6-digit PIN to secure your vault. This encrypts everything on this device."
            : "Re-enter your PIN to confirm."}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        {busy ? (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.onBrandPrimary} />
            <Text style={styles.busyText}>Securing your vault…</Text>
          </View>
        ) : (
          <PinPad pin={pin} onChange={setPin} onComplete={onComplete} errorSignal={errorSignal} disabled={busy} />
        )}
      </View>
    </LinearGradient>
  );
}

const useStyles = makeStyles((colors) => ({
  bg: { flex: 1, justifyContent: "space-between" },
  top: { alignItems: "center", paddingHorizontal: 32, gap: 8 },
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
  title: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 18, marginTop: 20 },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
  error: { color: "#FFD4D4", fontFamily: fonts.medium, fontSize: 13, marginTop: 10 },
  bottom: { alignItems: "center" },
  busy: { alignItems: "center", gap: 12, height: 300, justifyContent: "center" },
  busyText: { color: colors.onBrandPrimary, fontFamily: fonts.medium, fontSize: 15 },
}));
