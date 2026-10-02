import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { Modal, Platform, Pressable, Text, TextInput, View } from "react-native";

import { fonts } from "@/src/typography";
import { makeStyles, useTheme } from "@/src/theme";
import { formatDate } from "@/src/utils/format";
import { FieldDef } from "@/src/vault/schema";

interface FieldProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function Field({ field, value, onChange, error }: FieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const label = (
    <View style={styles.labelRow}>
      <Text style={styles.label}>{field.label}</Text>
      {field.optional ? <Text style={styles.optional}>Optional</Text> : null}
    </View>
  );

  if (field.type === "select") {
    const current = field.options?.find((o) => o.value === value);
    return (
      <View style={styles.wrap}>
        {label}
        <Pressable
          style={[styles.input, styles.selectInput, error && styles.inputError]}
          onPress={() => setSelectOpen(true)}
          testID={`field-${field.key}`}
        >
          <Text style={[styles.selectText, !current && styles.placeholder]}>
            {current?.label ?? "Select"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.muted} />
        </Pressable>
        <Modal visible={selectOpen} transparent animationType="fade" onRequestClose={() => setSelectOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setSelectOpen(false)} />
          <View style={styles.selectSheet}>
            {field.options?.map((o) => (
              <Pressable
                key={o.value}
                style={styles.selectOption}
                onPress={() => {
                  onChange(o.value);
                  setSelectOpen(false);
                }}
                testID={`option-${o.value}`}
              >
                <Text style={styles.selectOptionText}>{o.label}</Text>
                {o.value === value ? <Ionicons name="checkmark" size={20} color={colors.brandPrimary} /> : null}
              </Pressable>
            ))}
          </View>
        </Modal>
      </View>
    );
  }

  if (field.type === "date") {
    if (Platform.OS === "web") {
      return (
        <View style={styles.wrap}>
          {label}
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value}
            onChangeText={onChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            testID={`field-${field.key}`}
          />
        </View>
      );
    }
    return (
      <View style={styles.wrap}>
        {label}
        <Pressable
          style={[styles.input, styles.selectInput, error && styles.inputError]}
          onPress={() => setDateOpen(true)}
          testID={`field-${field.key}`}
        >
          <Text style={[styles.selectText, !value && styles.placeholder]}>
            {value ? formatDate(value) : "Select date"}
          </Text>
          <Ionicons name="calendar-outline" size={18} color={colors.muted} />
        </Pressable>
        {dateOpen ? (
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(_, selected) => {
              setDateOpen(false);
              if (selected) onChange(selected.toISOString());
            }}
          />
        ) : null}
      </View>
    );
  }

  const isSecret = field.type === "secret";
  const isMultiline = field.type === "multiline";

  return (
    <View style={styles.wrap}>
      {label}
      <View style={[styles.input, isMultiline && styles.multilineWrap, styles.inputRow, error && styles.inputError]}>
        <TextInput
          style={[styles.textInput, isMultiline && styles.multilineInput]}
          value={value}
          onChangeText={onChange}
          placeholder={field.placeholder ?? ""}
          placeholderTextColor={colors.muted}
          secureTextEntry={isSecret && !revealed}
          autoCapitalize={isSecret || field.key === "username" ? "none" : "sentences"}
          autoCorrect={!isSecret}
          keyboardType={field.type === "number" ? "decimal-pad" : "default"}
          multiline={isMultiline}
          testID={`field-${field.key}`}
        />
        {isSecret ? (
          <Pressable onPress={() => setRevealed((v) => !v)} hitSlop={10} testID={`field-reveal-${field.key}`}>
            <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { gap: 7 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: colors.onSurfaceTertiary, fontFamily: fonts.semibold, fontSize: 13 },
  optional: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11 },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 50,
    justifyContent: "center",
  },
  inputError: { borderColor: colors.error },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  textInput: { flex: 1, color: colors.onSurface, fontFamily: fonts.regular, fontSize: 15, paddingVertical: 12 },
  multilineWrap: { minHeight: 90, alignItems: "flex-start" },
  multilineInput: { minHeight: 70, textAlignVertical: "top" },
  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: colors.onSurface, fontFamily: fonts.regular, fontSize: 15 },
  placeholder: { color: colors.muted },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  selectSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 8,
    paddingBottom: 32,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectOptionText: { color: colors.onSurface, fontFamily: fonts.medium, fontSize: 16 },
}));
