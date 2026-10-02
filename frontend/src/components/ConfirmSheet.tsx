import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  icon = "alert-circle-outline",
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel} testID="confirm-backdrop" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} testID="confirm-sheet">
        <View style={styles.handle} />
        <View style={[styles.iconCircle, destructive && styles.iconCircleDanger]}>
          <Ionicons name={icon as any} size={28} color={destructive ? colors.error : colors.brandSecondary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable
          onPress={onConfirm}
          style={[styles.confirmBtn, destructive && styles.confirmBtnDanger]}
          testID="confirm-accept"
        >
          <Text style={styles.confirmText}>{confirmLabel}</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={styles.cancelBtn} testID="confirm-cancel">
          <Text style={styles.cancelText}>{cancelLabel}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: 8 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconCircleDanger: { backgroundColor: "#FBEAEA" },
  title: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 19, textAlign: "center" },
  message: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 8 },
  confirmBtn: {
    width: "100%",
    backgroundColor: colors.brandPrimary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  confirmBtnDanger: { backgroundColor: colors.error },
  confirmText: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 16 },
  cancelBtn: { width: "100%", paddingVertical: 14, alignItems: "center" },
  cancelText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 15 },
}));
