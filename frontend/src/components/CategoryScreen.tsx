import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChipRow } from "@/src/components/ChipRow";
import { EmptyState } from "@/src/components/EmptyState";
import { RecordCard } from "@/src/components/RecordCard";
import { SearchBar } from "@/src/components/SearchBar";
import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { usesNativeTabs } from "@/src/navigation";
import {
  CATEGORY_META,
  Category,
  getFields,
  getSummary,
  SUBTYPES,
  VaultRecord,
} from "@/src/vault/schema";
import { useVault } from "@/src/vault/VaultContext";

function searchableText(category: Category, rec: VaultRecord): string {
  const parts: string[] = [];
  const fields = getFields(category, rec.subtype);
  for (const f of fields) {
    if (f.type === "secret") continue;
    const v = rec[f.key];
    if (v) parts.push(String(v));
  }
  const s = getSummary(category, rec);
  parts.push(s.title, s.subtitle);
  return parts.join(" ").toLowerCase();
}

export function CategoryScreen({ category, showBack }: { category: Category; showBack?: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, lock } = useVault();
  const meta = CATEGORY_META[category];
  const subtypes = SUBTYPES[category];

  // Outside the tab navigator (showBack) there's no tab bar eating into the
  // bottom inset, so use it directly instead of the tab-bar-aware offsets.
  const bottomChrome = showBack ? insets.bottom : usesNativeTabs ? insets.bottom : 0;

  const [query, setQuery] = useState("");
  const [subtype, setSubtype] = useState<string>("all");

  const records = data?.[category] ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (subtype !== "all" && r.subtype !== subtype) return false;
      if (q && !searchableText(category, r).includes(q)) return false;
      return true;
    });
  }, [records, query, subtype, category]);

  const iconFor = (rec: VaultRecord) =>
    subtypes.find((s) => s.value === rec.subtype)?.icon ?? meta.icon;

  const addRecord = () => {
    const chosen = subtype !== "all" ? subtype : subtypes[0]?.value;
    router.push({ pathname: "/form", params: { category, subtype: chosen ?? "" } });
  };

  const chips = [{ value: "all", label: "All" }, ...subtypes.map((s) => ({ value: s.value, label: s.label }))];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.titleRow}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={styles.lockBtn} hitSlop={8} testID="category-back">
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>
          ) : null}
          <Text style={[styles.title, showBack && styles.titleWithBack]}>{meta.title}</Text>
          <Pressable onPress={lock} style={styles.lockBtn} hitSlop={8} testID="lock-button">
            <Ionicons name="lock-closed-outline" size={20} color={colors.brandPrimary} />
          </Pressable>
        </View>
        <SearchBar value={query} onChangeText={setQuery} placeholder={`Search ${meta.title.toLowerCase()}`} />
      </View>

      {subtypes.length > 0 ? <ChipRow items={chips} selected={subtype} onSelect={setSubtype} /> : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: subtypes.length > 0 ? 4 : 12, paddingBottom: bottomChrome + 110 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <RecordCard
            category={category}
            record={item}
            icon={iconFor(item)}
            onPress={() => router.push({ pathname: "/detail", params: { category, id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={query ? "search-outline" : meta.icon}
            title={query ? "No matches" : `No ${meta.title.toLowerCase()} yet`}
            message={
              query
                ? "Try a different search term."
                : `Add your first ${meta.singular.toLowerCase()} to keep it safe and organized.`
            }
            actionLabel={query ? undefined : `Add ${meta.singular}`}
            onAction={query ? undefined : addRecord}
          />
        }
      />

      <Pressable
        onPress={addRecord}
        style={[
          styles.fab,
          {
            bottom: showBack
              ? insets.bottom + 16
              : usesNativeTabs
                ? insets.bottom + 16
                : Platform.OS === "web"
                  ? 16 + 64
                  : 16,
          },
        ]}
        testID="add-record-fab"
      >
        <Ionicons name="add" size={28} color={colors.onBrandPrimary} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 14, backgroundColor: colors.surface },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 30 },
  titleWithBack: { flex: 1, fontSize: 22 },
  lockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 16 },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
}));
