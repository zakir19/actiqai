import { UpgradeView } from "@/modules/premium/ui/views/upgrade-view";
import { getUserUsageAndPlan } from "@/modules/premium/server/procedures";
import { getAllProductsWithPrices } from "@/modules/premium/server/polar-products";
import { redirect } from "next/navigation";

// Force dynamic rendering - no caching at all
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function UpgradePage() {
  try {
    const [usageData, polarProducts] = await Promise.all([
      getUserUsageAndPlan(),
      getAllProductsWithPrices(),
    ]);

    console.log(`📊 Loaded ${polarProducts.length} products for upgrade page`);

    if (!polarProducts || polarProducts.length === 0) {
      console.warn("⚠️ No Polar products found. Make sure you have created products in Polar dashboard.");
    }

    return <UpgradeView initialData={usageData} polarProducts={polarProducts} />;
  } catch (error) {
    console.error("Error loading upgrade page:", error);
    // User not authenticated
    redirect("/login");
  }
}
