import { Pressable, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { fonts } from "@/src/typography";
import { makeStyles } from "@/src/theme";

export interface ChipItem {
  value: string;
  label: string;
}

interface ChipRowProps {
  items: ChipItem[];
  selected: string;
  onSelect: (value: string) => void;
}

// Horizontal, non-wrapping filter row (part of the sticky header).
export function ChipRow({ items, selected, onSelect }: ChipRowProps) {
  const styles = useStyles();
  return (
    <View style={styles.row} testID="chip-row">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {items.map((item) => {
          const active = item.value === selected;
          return (
            <Pressable
              key={item.value}
              testID={`chip-${item.value}`}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
                onSelect(item.value);
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { height: 56, justifyContent: "center" },
  content: { gap: 8, paddingHorizontal: 16, alignItems: "center" },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { color: colors.onSurfaceTertiary, fontFamily: fonts.medium, fontSize: 14 },
  chipTextActive: { color: colors.onBrandPrimary },
}));
