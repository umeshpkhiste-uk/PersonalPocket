import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Pressable, Text, View } from "react-native";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { formatCurrency, initials } from "@/src/utils/format";
import { Category, getSummary, VaultRecord } from "@/src/vault/schema";

interface RecordCardProps {
  category: Category;
  record: VaultRecord;
  icon: string;
  onPress: () => void;
}

export function RecordCard({ category, record, icon, onPress }: RecordCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const s = getSummary(category, record);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      testID={`record-card-${record.id}`}
    >
      <View style={styles.badge}>
        {category === "credentials" ? (
          <Text style={styles.badgeText}>{initials(s.title)}</Text>
        ) : (
          <Ionicons name={icon as any} size={22} color={colors.brandSecondary} />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {s.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {s.subtitle}
        </Text>
      </View>
      <View style={styles.right}>
        {s.amount !== undefined ? (
          <>
            <Text style={[styles.amount, s.negative && styles.amountNegative]} numberOfLines={1}>
              {formatCurrency(s.amount)}
            </Text>
            <Text style={styles.amountLabel}>{s.amountLabel}</Text>
          </>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        )}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.brandPrimary, fontFamily: fonts.bold, fontSize: 16 },
  body: { flex: 1 },
  title: { color: colors.onSurface, fontFamily: fonts.semibold, fontSize: 16 },
  subtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  right: { alignItems: "flex-end", maxWidth: 130 },
  amount: { color: colors.onSurface, fontFamily: fonts.bold, fontSize: 15 },
  amountNegative: { color: colors.warning },
  amountLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11, marginTop: 1 },
}));
