import { useLocalSearchParams } from "expo-router";

import { CategoryScreen } from "@/src/components/CategoryScreen";
import { Category } from "@/src/vault/schema";

// Generic pushed (non-tab) category list — used from the Home dashboard
// for categories that don't have their own bottom tab (Notes, API & SSH
// Keys, Identity & IDs, Software Licenses).
export default function CategoryRoute() {
  const { category } = useLocalSearchParams<{ category: Category }>();
  return <CategoryScreen category={category} showBack />;
}
