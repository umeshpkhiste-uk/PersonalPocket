import { Ionicons } from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { formatRelativeTime } from "@/src/utils/format";
import { usesNativeTabs } from "@/src/navigation";
import { CATEGORY_META, Category, getSummary, SUBTYPES, VaultRecord } from "@/src/vault/schema";
import { useVault } from "@/src/vault/VaultContext";

const ALL_CATEGORIES: Category[] = [
  "credentials",
  "banking",
  "investments",
  "loans",
  "notes",
  "api_keys",
  "identity",
  "licenses",
];

// Categories that live on the bottom tab bar navigate straight to their tab;
// the rest (no dedicated tab) push the generic /category route.
const TAB_ROUTE: Partial<Record<Category, string>> = {
  credentials: "/(tabs)/credentials",
  banking: "/(tabs)/banking",
  investments: "/(tabs)/investments",
  loans: "/(tabs)/loans",
};

function openCategory(category: Category) {
  const tabRoute = TAB_ROUTE[category];
  if (tabRoute) router.push(tabRoute as any);
  else router.push({ pathname: "/category", params: { category } });
}

interface RecentItem {
  category: Category;
  record: VaultRecord;
}

export default function Home() {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data, lock } = useVault();
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const counts = useMemo(() => {
    const out: Partial<Record<Category, number>> = {};
    for (const cat of ALL_CATEGORIES) out[cat] = data?.[cat]?.length ?? 0;
    return out;
  }, [data]);

  const recent = useMemo<RecentItem[]>(() => {
    if (!data) return [];
    const all: RecentItem[] = [];
    for (const cat of ALL_CATEGORIES) {
      for (const record of data[cat]) all.push({ category: cat, record });
    }
    return all.sort((a, b) => b.record.updatedAt.localeCompare(a.record.updatedAt)).slice(0, 6);
  }, [data]);

  const totalCount = ALL_CATEGORIES.reduce((sum, cat) => sum + (counts[cat] ?? 0), 0);

  const heroCategory = ALL_CATEGORIES[0];
  const tailCategory = ALL_CATEGORIES[ALL_CATEGORIES.length - 1];
  const gridCategories = ALL_CATEGORIES.slice(1, -1);

  const countLabel = (category: Category, n: number) => {
    const unit = n === 1 ? CATEGORY_META[category].singular : `${CATEGORY_META[category].singular}s`;
    return `${n} ${unit.toLowerCase()}`;
  };

  const addToCategory = (category: Category) => {
    setAddPickerOpen(false);
    const subtype = SUBTYPES[category][0]?.value;
    router.push({ pathname: "/form", params: { category, subtype: subtype ?? "" } });
  };

  const renderTile = (category: Category, full?: boolean) => {
    const meta = CATEGORY_META[category];
    const n = counts[category] ?? 0;
    return (
      <Pressable
        key={category}
        onPress={() => openCategory(category)}
        style={[styles.tile, full ? styles.tileFull : styles.tileHalf]}
        testID={`home-tile-${category}`}
      >
        <View style={styles.tileIcon}>
          <Ionicons name={meta.icon as any} size={22} color={colors.brandPrimary} />
        </View>
        <View style={styles.tileBody}>
          <Text style={styles.tileTitle} numberOfLines={1}>{meta.title}</Text>
          <Text style={styles.tileSubtitle} numberOfLines={1}>
            {n > 0 ? `Tap to view all` : "No items yet"}
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{countLabel(category, n)}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: bottomChrome + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerCount}>{ALL_CATEGORIES.length} categories</Text>
            <Pressable onPress={lock} style={styles.lockBtn} hitSlop={8} testID="home-lock-button">
              <Ionicons name="lock-closed-outline" size={18} color={colors.brandPrimary} />
            </Pressable>
          </View>
        </View>

        {renderTile(heroCategory, true)}

        <View style={styles.grid}>
          {gridCategories.map((cat) => renderTile(cat))}
        </View>

        {renderTile(tailCategory, true)}

        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionLabel}>Recent Access</Text>
        </View>

        {recent.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Ionicons name="time-outline" size={22} color={colors.muted} />
            <Text style={styles.emptyRecentText}>Records you add or edit will show up here.</Text>
          </View>
        ) : (
          <View style={styles.recentGroup}>
            {recent.map(({ category, record }, i) => {
              const summary = getSummary(category, record);
              return (
                <Pressable
                  key={record.id}
                  onPress={() => router.push({ pathname: "/detail", params: { category, id: record.id } })}
                  style={[styles.recentRow, i > 0 && styles.recentRowDivider]}
                  testID={`recent-item-${record.id}`}
                >
                  <View style={styles.recentIcon}>
                    <Ionicons name={CATEGORY_META[category].icon as any} size={18} color={colors.brandSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentTitle} numberOfLines={1}>{summary.title}</Text>
                    <Text style={styles.recentSubtitle} numberOfLines={1}>
                      {CATEGORY_META[category].title} · {formatRelativeTime(record.updatedAt)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setAddPickerOpen(true)}
        style={[
          styles.fab,
          { bottom: usesNativeTabs ? insets.bottom + 16 : Platform.OS === "web" ? 16 + 64 : 16 },
        ]}
        testID="home-add-fab"
      >
        <Ionicons name="add" size={20} color={colors.onBrandPrimary} />
        <Text style={styles.fabText}>Add Item</Text>
      </Pressable>

      <Modal visible={addPickerOpen} transparent animationType="fade" onRequestClose={() => setAddPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAddPickerOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Add to which category?</Text>
          {ALL_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={styles.sheetOption}
              onPress={() => addToCategory(cat)}
              testID={`add-picker-${cat}`}
            >
              <View style={styles.tileIcon}>
                <Ionicons name={CATEGORY_META[cat].icon as any} size={18} color={colors.brandPrimary} />
              </View>
              <Text style={styles.sheetOptionText}>{CATEGORY_META[cat].title}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 16, gap: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerTitle: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 28 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerCount: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  lockBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  tileFull: { width: "100%" },
  tileHalf: { flexBasis: "47%", flexGrow: 1 },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  tileBody: { gap: 2 },
  tileTitle: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 16 },
  tileSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  countPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandTertiary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: { color: colors.brandPrimary, fontFamily: fonts.semibold, fontSize: 12 },
  recentHeaderRow: { marginTop: 14 },
  sectionLabel: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  emptyRecent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  emptyRecentText: { flex: 1, color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },
  recentGroup: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  recentRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  recentTitle: { color: colors.onSurface, fontFamily: fonts.semibold, fontSize: 14 },
  recentSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
  fab: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: colors.brandPrimary,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: { color: colors.onBrandPrimary, fontFamily: fonts.semibold, fontSize: 15 },
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
    gap: 2,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: "center", marginBottom: 12 },
  sheetTitle: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 18, marginBottom: 8 },
  sheetOption: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  sheetOptionText: { color: colors.onSurface, fontFamily: fonts.medium, fontSize: 15 },
}));
