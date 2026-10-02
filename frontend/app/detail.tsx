import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmSheet } from "@/src/components/ConfirmSheet";
import { DetailRow } from "@/src/components/DetailRow";
import { useToast } from "@/src/components/Toast";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { formatCurrency, formatDate, initials } from "@/src/utils/format";
import {
  CATEGORY_META,
  Category,
  getFields,
  getSummary,
  subtypeLabel,
} from "@/src/vault/schema";
import { useVault } from "@/src/vault/VaultContext";

const CURRENCY_KEYS = new Set(["balance", "principal", "amount", "currentValue", "emi", "outstanding"]);

export default function Detail() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { category, id } = useLocalSearchParams<{ category: Category; id: string }>();
  const { getRecord, deleteRecord } = useVault();
  const [confirm, setConfirm] = useState(false);

  const record = getRecord(category, id);
  const meta = CATEGORY_META[category];

  if (!record) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.missing}>Record not found.</Text>
        <Pressable onPress={() => router.back()} testID="detail-back-missing">
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const summary = getSummary(category, record);
  const fields = getFields(category, record.subtype).filter((f) => {
    const v = record[f.key];
    return v !== undefined && v !== null && String(v).trim() !== "";
  });

  const formatValue = (key: string, type: string, value: any): string => {
    if (type === "date") return formatDate(value);
    if (type === "number" && CURRENCY_KEYS.has(key)) return formatCurrency(value);
    return String(value);
  };

  const onDelete = async () => {
    setConfirm(false);
    await deleteRecord(category, id);
    toast.show(`${meta.singular} deleted`, "success");
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8} testID="detail-back">
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push({ pathname: "/form", params: { category, id, subtype: record.subtype ?? "" } })}
            style={styles.iconBtn}
            hitSlop={8}
            testID="detail-edit"
          >
            <Ionicons name="create-outline" size={22} color={colors.brandPrimary} />
          </Pressable>
          <Pressable onPress={() => setConfirm(true)} style={styles.iconBtn} hitSlop={8} testID="detail-delete">
            <Ionicons name="trash-outline" size={21} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            {category === "credentials" ? (
              <Text style={styles.heroInitials}>{initials(summary.title)}</Text>
            ) : (
              <Ionicons name={meta.icon as any} size={30} color={colors.brandSecondary} />
            )}
          </View>
          <Text style={styles.heroTitle}>{summary.title}</Text>
          {record.subtype ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{subtypeLabel(category, record.subtype)}</Text>
            </View>
          ) : (
            <Text style={styles.heroSub}>{summary.subtitle}</Text>
          )}
        </View>

        <View style={styles.card}>
          {fields.map((f) => (
            <DetailRow
              key={f.key}
              label={f.label}
              value={formatValue(f.key, f.type, record[f.key])}
              secret={f.type === "secret"}
              multiline={f.type === "multiline"}
            />
          ))}
        </View>

        <Text style={styles.footer}>Stored encrypted on this device · Updated {formatDate(record.updatedAt)}</Text>
      </ScrollView>

      <ConfirmSheet
        visible={confirm}
        destructive
        icon="trash-outline"
        title={`Delete this ${meta.singular.toLowerCase()}?`}
        message="This permanently removes the record from your vault. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={onDelete}
        onCancel={() => setConfirm(false)}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  missing: { color: colors.onSurface, fontFamily: fonts.medium, fontSize: 16 },
  link: { color: colors.brandPrimary, fontFamily: fonts.semibold, fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerActions: { flexDirection: "row", gap: 4 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16 },
  hero: { alignItems: "center", gap: 10, paddingVertical: 12 },
  heroBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitials: { color: colors.brandPrimary, fontFamily: fonts.bold, fontSize: 26 },
  heroTitle: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 22, textAlign: "center" },
  heroSub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14 },
  pill: { backgroundColor: colors.brandTertiary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  pillText: { color: colors.brandPrimary, fontFamily: fonts.semibold, fontSize: 12 },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },
  footer: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, textAlign: "center", marginTop: 20 },
}));
