import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { Field } from "@/src/components/Field";
import { useToast } from "@/src/components/Toast";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { genId } from "@/src/utils/format";
import {
  CATEGORY_META,
  Category,
  getFields,
  SUBTYPES,
  VaultRecord,
} from "@/src/vault/schema";
import { useVault } from "@/src/vault/VaultContext";

export default function Form() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const params = useLocalSearchParams<{ category: Category; subtype?: string; id?: string }>();
  const category = params.category;
  const { getRecord, upsertRecord } = useVault();
  const meta = CATEGORY_META[category];
  const subtypes = SUBTYPES[category];

  const editing = Boolean(params.id);
  const existing = editing ? getRecord(category, params.id!) : undefined;

  const [subtype, setSubtype] = useState<string>(existing?.subtype ?? params.subtype ?? subtypes[0]?.value ?? "");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (existing) {
      for (const [k, v] of Object.entries(existing)) {
        if (["id", "createdAt", "updatedAt", "subtype"].includes(k)) continue;
        init[k] = v == null ? "" : String(v);
      }
    }
    return init;
  });
  const [touchedSave, setTouchedSave] = useState(false);

  const fields = useMemo(() => getFields(category, subtype), [category, subtype]);
  const requiredKey = fields[0].key;

  const setValue = (key: string, value: string) => setValues((p) => ({ ...p, [key]: value }));

  const save = () => {
    setTouchedSave(true);
    if (!values[requiredKey] || values[requiredKey].trim() === "") {
      toast.show(`${fields[0].label} is required`, "error");
      return;
    }
    const record: VaultRecord = {
      id: existing?.id ?? genId(),
      subtype: subtypes.length ? subtype : undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    for (const f of fields) {
      const v = values[f.key];
      if (v !== undefined && v !== "") record[f.key] = v;
    }
    upsertRecord(category, record);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast.show(editing ? `${meta.singular} updated` : `${meta.singular} added`, "success");
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8} testID="form-close">
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {editing ? `Edit ${meta.singular}` : `New ${meta.singular}`}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        {subtypes.length > 0 && !editing ? (
          <View style={styles.typeWrap}>
            <Text style={styles.typeLabel}>Type</Text>
            <View style={styles.typeRow}>
              {subtypes.map((s) => {
                const active = s.value === subtype;
                return (
                  <Pressable
                    key={s.value}
                    onPress={() => setSubtype(s.value)}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    testID={`type-chip-${s.value}`}
                  >
                    <Ionicons name={s.icon as any} size={16} color={active ? colors.onBrandPrimary : colors.brandSecondary} />
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.fields}>
          {fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={values[f.key] ?? ""}
              onChange={(v) => setValue(f.key, v)}
              error={touchedSave && f.key === requiredKey && !values[f.key]}
            />
          ))}
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable onPress={save} style={styles.saveBtn} testID="form-save">
          <Ionicons name="shield-checkmark" size={18} color={colors.onBrandPrimary} />
          <Text style={styles.saveText}>{editing ? "Update" : "Save"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 17 },
  content: { padding: 16, gap: 18 },
  typeWrap: { gap: 10 },
  typeLabel: { color: colors.onSurfaceTertiary, fontFamily: fonts.semibold, fontSize: 13 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 999,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  typeChipText: { color: colors.onSurfaceTertiary, fontFamily: fonts.medium, fontSize: 14 },
  typeChipTextActive: { color: colors.onBrandPrimary },
  fields: { gap: 16 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brandPrimary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveText: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 16 },
}));
