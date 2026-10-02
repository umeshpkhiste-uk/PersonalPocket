import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmSheet } from "@/src/components/ConfirmSheet";
import { useToast } from "@/src/components/Toast";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { useVault } from "@/src/vault/VaultContext";

const AUTO_LOCK_OPTIONS = [
  { label: "1 minute", value: 1 },
  { label: "2 minutes", value: 2 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
];

export default function More() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { settings, biometricAvailable, updateSettings, lock, exportVault, wipeAll } = useVault();

  const [lockPickerOpen, setLockPickerOpen] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(false);

  const autoLockLabel =
    AUTO_LOCK_OPTIONS.find((o) => o.value === settings.autoLockMinutes)?.label ?? `${settings.autoLockMinutes} min`;

  const onExport = async () => {
    const res = await exportVault();
    toast.show(res.message, res.ok ? "success" : "error");
  };

  const onWipe = async () => {
    setWipeConfirm(false);
    await wipeAll();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 80 : 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Security */}
        <Text style={styles.sectionLabel}>Security</Text>
        <View style={styles.group}>
          <Row icon="finger-print" label="Biometric Unlock" subtitle={biometricAvailable ? "Face ID / Fingerprint" : "Not available on this device"}>
            <Switch
              testID="toggle-biometric"
              value={settings.biometricEnabled && biometricAvailable}
              disabled={!biometricAvailable}
              onValueChange={(v) => updateSettings({ biometricEnabled: v })}
              trackColor={{ true: colors.brandSecondary, false: colors.borderStrong }}
              thumbColor={colors.surfaceSecondary}
            />
          </Row>
          <Divider />
          <Pressable style={styles.row} onPress={() => setLockPickerOpen(true)} testID="row-autolock">
            <RowInner icon="time-outline" label="Auto-Lock" subtitle="Lock after inactivity" />
            <View style={styles.valuePill}>
              <Text style={styles.valueText}>{autoLockLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </Pressable>
          <Divider />
          <Row icon="eye-off-outline" label="Hide in Screenshots" subtitle="Blocks screen capture & previews">
            <Switch
              testID="toggle-screenshot"
              value={settings.screenshotProtection}
              onValueChange={(v) => updateSettings({ screenshotProtection: v })}
              trackColor={{ true: colors.brandSecondary, false: colors.borderStrong }}
              thumbColor={colors.surfaceSecondary}
            />
          </Row>
          <Divider />
          <Pressable style={styles.row} onPress={lock} testID="row-lock-now">
            <RowInner icon="lock-closed-outline" label="Lock Now" subtitle="Lock the vault immediately" />
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* Data */}
        <Text style={styles.sectionLabel}>Data & Backup</Text>
        <View style={styles.group}>
          <Pressable style={styles.row} onPress={onExport} testID="row-export">
            <RowInner icon="download-outline" label="Export Encrypted Backup" subtitle="Saved as an AES-encrypted file" />
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
          <Divider />
          <Pressable style={styles.row} onPress={() => setWipeConfirm(true)} testID="row-wipe">
            <RowInner icon="trash-outline" label="Delete All Data" subtitle="Permanently erase everything" danger />
            <Ionicons name="chevron-forward" size={18} color={colors.error} />
          </Pressable>
        </View>

        <View style={styles.aboutCard}>
          <Ionicons name="shield-checkmark" size={22} color={colors.brandSecondary} />
          <Text style={styles.aboutText}>
            Everything you store is encrypted on this device with your PIN. PersonalPocket never sends your records to
            any bank, broker, analytics service, or third party.
          </Text>
        </View>
      </ScrollView>

      {/* Auto-lock picker */}
      <Modal visible={lockPickerOpen} transparent animationType="fade" onRequestClose={() => setLockPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setLockPickerOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Auto-Lock Timer</Text>
          {AUTO_LOCK_OPTIONS.map((o) => (
            <Pressable
              key={o.value}
              style={styles.option}
              onPress={() => {
                updateSettings({ autoLockMinutes: o.value });
                setLockPickerOpen(false);
              }}
              testID={`autolock-${o.value}`}
            >
              <Text style={styles.optionText}>{o.label}</Text>
              {settings.autoLockMinutes === o.value ? (
                <Ionicons name="checkmark" size={20} color={colors.brandPrimary} />
              ) : null}
            </Pressable>
          ))}
        </View>
      </Modal>

      <ConfirmSheet
        visible={wipeConfirm}
        destructive
        icon="warning-outline"
        title="Delete all data?"
        message="This permanently erases every record and resets your PIN. There is no backup and this cannot be undone."
        confirmLabel="Erase Everything"
        onConfirm={onWipe}
        onCancel={() => setWipeConfirm(false)}
      />
    </View>
  );
}

function Row({
  icon,
  label,
  subtitle,
  children,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <RowInner icon={icon} label={label} subtitle={subtitle} />
      {children}
    </View>
  );
}

function RowInner({
  icon,
  label,
  subtitle,
  danger,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  danger?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.rowInner}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon as any} size={20} color={danger ? colors.error : colors.brandSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: colors.surface },
  title: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 30 },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },
  sectionLabel: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 14,
    marginLeft: 4,
  },
  group: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  rowInner: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: { backgroundColor: "#FBEAEA" },
  rowLabel: { color: colors.onSurface, fontFamily: fonts.semibold, fontSize: 15 },
  rowLabelDanger: { color: colors.error },
  rowSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.divider, marginLeft: 64 },
  valuePill: { flexDirection: "row", alignItems: "center", gap: 2 },
  valueText: { color: colors.brandSecondary, fontFamily: fonts.medium, fontSize: 14 },
  aboutCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.brandTertiary,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  aboutText: { flex: 1, color: colors.brandPrimary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: "center", marginBottom: 12 },
  sheetTitle: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 18, marginBottom: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: { color: colors.onSurface, fontFamily: fonts.medium, fontSize: 16 },
}));

function Divider() {
  const styles = useStyles();
  return <View style={styles.divider} />;
}
