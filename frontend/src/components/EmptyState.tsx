import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Pressable, Text, View } from "react-native";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "folder-open-outline", title, message, actionLabel, onAction }: EmptyStateProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} testID="empty-state">
      <View style={styles.iconCircle}>
        <Ionicons name={icon as any} size={34} color={colors.brandSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.button} testID="empty-state-action">
          <Ionicons name="add" size={18} color={colors.onBrandPrimary} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 10 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 18, textAlign: "center" },
  message: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, textAlign: "center", lineHeight: 20 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 15 },
}));
