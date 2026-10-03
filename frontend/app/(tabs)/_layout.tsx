import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { fonts } from "@/src/typography";
import { useTheme } from "@/src/theme";
import { usesNativeTabs } from "@/src/navigation";

export default function TabsLayout() {
  const { colors } = useTheme();

  if (usesNativeTabs) {
    const { NativeTabs } = require("expo-router/unstable-native-tabs");
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="key.fill" />
          <NativeTabs.Trigger.Label>Credentials</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="banking">
          <NativeTabs.Trigger.Icon sf="building.columns.fill" />
          <NativeTabs.Trigger.Label>Banking</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="investments">
          <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" />
          <NativeTabs.Trigger.Label>Investments</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="loans">
          <NativeTabs.Trigger.Icon sf="indianrupeesign.circle.fill" />
          <NativeTabs.Trigger.Label>Loans</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="more">
          <NativeTabs.Trigger.Icon sf="gearshape.fill" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  const icon = (name: string) => ({ color, size }: { color: string; size: number }) =>
    <Ionicons name={name as any} size={size} color={color} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Credentials", tabBarIcon: icon("key-outline") }} />
      <Tabs.Screen name="banking" options={{ title: "Banking", tabBarIcon: icon("business-outline") }} />
      <Tabs.Screen name="investments" options={{ title: "Investments", tabBarIcon: icon("trending-up-outline") }} />
      <Tabs.Screen name="loans" options={{ title: "Loans", tabBarIcon: icon("cash-outline") }} />
      <Tabs.Screen name="more" options={{ title: "Settings", tabBarIcon: icon("settings-outline") }} />
    </Tabs>
  );
}
