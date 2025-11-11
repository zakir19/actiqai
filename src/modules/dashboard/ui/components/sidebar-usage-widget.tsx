"use client";

import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Rocket } from "lucide-react";

export function SidebarUsageWidget() {
  // Fetch usage data
  const { data, isLoading } = useQuery({
    queryKey: ["usage-data"],
    queryFn: async () => {
      const response = await fetch("/api/usage");
      if (!response.ok) throw new Error("Failed to fetch usage");
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (isLoading || !data) {
    return null;
  }

  const { user, limits } = data;
  const isFreeTier = user.plan === "free";
  const isUnlimited = limits.agents === -1;

  if (!isFreeTier) {
    return null; // Only show for free tier users
  }

  const agentUsagePercent = (user.agentsUsed / limits.agents) * 100;
  const meetingUsagePercent = (user.meetingsUsed / limits.meetings) * 100;

  return (
    <div className="px-3 py-3 mb-2 rounded-lg border border-border/10 bg-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Rocket className="size-4 text-primary" />
        <span className="text-xs font-semibold text-primary">Free Trial</span>
      </div>

      {/* Agents Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Agents</span>
          <span className="text-xs font-medium">
            {user.agentsUsed}/{limits.agents}
          </span>
        </div>
        <Progress
          value={agentUsagePercent}
          className={agentUsagePercent >= 100 ? "bg-red-900/20" : "bg-white/10"}
        />
      </div>

      {/* Meetings Progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Meetings</span>
          <span className="text-xs font-medium">
            {user.meetingsUsed}/{limits.meetings}
          </span>
        </div>
        <Progress
          value={meetingUsagePercent}
          className={meetingUsagePercent >= 100 ? "bg-red-900/20" : "bg-white/10"}
        />
      </div>
    </div>
  );
}
