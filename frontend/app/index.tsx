import { Ionicons } from "@react-native-vector-icons/ionicons";
import { ActivityIndicator, View } from "react-native";

import { makeStyles, useTheme } from "@/src/theme";

// Splash while the vault bootstraps; LockGate redirects to the right screen.
export default function Index() {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.container} testID="splash">
      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={40} color={colors.onBrandPrimary} />
      </View>
      <ActivityIndicator color={colors.brandSecondary} />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: 24 },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
