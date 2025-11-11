import { Suspense } from "react";
import { UpgradeSuccessView } from "@/modules/premium/ui/views/upgrade-success-view";
import { getUserUsageAndPlan } from "@/modules/premium/server/procedures";

export default async function UpgradeSuccessPage() {
  const usageData = await getUserUsageAndPlan();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpgradeSuccessView userData={usageData} />
    </Suspense>
  );
}
