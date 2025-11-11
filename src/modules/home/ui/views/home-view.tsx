"use client";

import { DashboardTrial } from "@/modules/premium/ui/components/dashboard-trial";
import { getUserUsageAndPlan } from "@/modules/premium/server/procedures";

interface HomeViewProps {
    usageData: Awaited<ReturnType<typeof getUserUsageAndPlan>>;
}

export const HomeView = ({ usageData }: HomeViewProps) => {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back! Here's your account overview.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2 lg:col-span-1">
                    <DashboardTrial data={usageData} />
                </div>

                {/* Add more dashboard widgets here */}
            </div>
        </div>
    );
};
