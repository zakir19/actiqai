import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { getUserUsageAndPlan } from "@/modules/premium/server/procedures";

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    // Get user usage data for premium features
    const usageData = await getUserUsageAndPlan();

    return <HomeView usageData={usageData} />;
};

export default Page;