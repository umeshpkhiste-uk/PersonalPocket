import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Pressable, Text, TextInput, View } from "react-native";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { CustomField } from "@/src/vault/schema";

interface CustomFieldRowProps {
  field: CustomField;
  onChange: (patch: Partial<Pick<CustomField, "label" | "value">>) => void;
  onRemove: () => void;
}

export function CustomFieldRow({ field, onChange, onRemove }: CustomFieldRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.labelInput]}
          value={field.label}
          onChangeText={(v) => onChange({ label: v })}
          placeholder="Field name"
          placeholderTextColor={colors.muted}
          testID={`custom-field-label-${field.key}`}
        />
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          style={styles.removeBtn}
          testID={`custom-field-remove-${field.key}`}
        >
          <Ionicons name="close-circle" size={22} color={colors.muted} />
        </Pressable>
      </View>
      <TextInput
        style={[styles.input, styles.valueInput]}
        value={field.value}
        onChangeText={(v) => onChange({ value: v })}
        placeholder="Value"
        placeholderTextColor={colors.muted}
        testID={`custom-field-value-${field.key}`}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    gap: 7,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  removeBtn: { padding: 2 },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    color: colors.onSurface,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  labelInput: { flex: 1, fontFamily: fonts.semibold },
  valueInput: {},
}));
