import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { useToast } from "@/src/components/Toast";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

interface DetailRowProps {
  label: string;
  value: string;
  secret?: boolean;
  multiline?: boolean;
}

export function DetailRow({ label, value, secret, multiline }: DetailRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const toast = useToast();
  const [revealed, setRevealed] = useState(false);

  const display = secret && !revealed ? "••••••••" : value;

  const copy = async () => {
    await Clipboard.setStringAsync(value);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast.show(`${label} copied`, "success");
  };

  const toggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setRevealed((v) => !v);
  };

  return (
    <View style={styles.row} testID={`detail-row-${label}`}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, secret && !revealed && styles.secretValue, multiline && styles.multiline]} numberOfLines={multiline ? undefined : 2}>
          {display}
        </Text>
        {secret ? (
          <View style={styles.actions}>
            <Pressable onPress={toggle} hitSlop={8} style={styles.actionBtn} testID={`reveal-${label}`}>
              <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={20} color={colors.brandSecondary} />
            </Pressable>
            <Pressable onPress={copy} hitSlop={8} style={styles.actionBtn} testID={`copy-${label}`}>
              <Ionicons name="copy-outline" size={19} color={colors.brandSecondary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 6,
  },
  label: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  valueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  value: { flex: 1, color: colors.onSurface, fontFamily: fonts.medium, fontSize: 16 },
  secretValue: { letterSpacing: 2, fontSize: 18 },
  multiline: { lineHeight: 22, fontFamily: fonts.regular },
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandTertiary },
}));
