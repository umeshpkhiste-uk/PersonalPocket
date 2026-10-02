// Design tokens for PersonalPocket — calm, premium, trust-critical vault.
// Light theme. Keys match the "color" block of /app/design_guidelines.json.
// Components build StyleSheets with makeStyles() and read colors with useTheme().

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // Surfaces
  surface: "#F9FAF9",
  onSurface: "#11181C",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#11181C",
  surfaceTertiary: "#F1F3F5",
  onSurfaceTertiary: "#495057",
  surfaceInverse: "#0D151C",
  onSurfaceInverse: "#FFFFFF",
  muted: "#868E96",

  // Brand — deep teal
  brand: "#0A4250",
  onBrand: "#FFFFFF",
  brandPrimary: "#0A4250",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#1B6C7D",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#E2EFF1",
  onBrandTertiary: "#0A4250",

  // Status
  success: "#2B8A3E",
  onSuccess: "#FFFFFF",
  warning: "#E67700",
  onWarning: "#FFFFFF",
  error: "#C92A2A",
  onError: "#FFFFFF",
  info: "#0A4250",
  onInfo: "#FFFFFF",

  // Lines
  border: "#E9ECEF",
  borderStrong: "#CED4DA",
  divider: "#F1F3F5",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
