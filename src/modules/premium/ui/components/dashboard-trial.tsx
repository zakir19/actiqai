"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserUsageAndPlan } from "../../server/procedures";

interface DashboardTrialProps {
  data: Awaited<ReturnType<typeof getUserUsageAndPlan>>;
}

export function DashboardTrial({ data }: DashboardTrialProps) {
  const router = useRouter();
  const { user, limits } = data;

  const agentUsagePercent = limits.agents === -1 ? 0 : (user.agentsUsed / limits.agents) * 100;
  const meetingUsagePercent = limits.meetings === -1 ? 0 : (user.meetingsUsed / limits.meetings) * 100;

  const isFreeTier = user.plan === "free";
  const isUnlimited = limits.agents === -1;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {limits.displayName}
              {user.plan !== "free" && (
                <Badge className="bg-primary">
                  <Zap className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isFreeTier ? "Upgrade to unlock more features" : "You're on a premium plan"}
            </CardDescription>
          </div>
          {isFreeTier && (
            <Button onClick={() => router.push("/upgrade")} size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Agents Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">AI Agents</span>
            <span className="text-muted-foreground">
              {isUnlimited ? (
                <Badge variant="outline" className="border-primary text-primary">
                  Unlimited
                </Badge>
              ) : (
                <>
                  {user.agentsUsed}/{limits.agents}
                </>
              )}
            </span>
          </div>
          {!isUnlimited && (
            <Progress
              value={agentUsagePercent}
              className={agentUsagePercent >= 100 ? "bg-red-200" : ""}
            />
          )}
        </div>

        {/* Meetings Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Meetings</span>
            <span className="text-muted-foreground">
              {isUnlimited ? (
                <Badge variant="outline" className="border-primary text-primary">
                  Unlimited
                </Badge>
              ) : (
                <>
                  {user.meetingsUsed}/{limits.meetings}
                </>
              )}
            </span>
          </div>
          {!isUnlimited && (
            <Progress
              value={meetingUsagePercent}
              className={meetingUsagePercent >= 100 ? "bg-red-200" : ""}
            />
          )}
        </div>

        {/* Warning if near limit */}
        {isFreeTier && (agentUsagePercent >= 80 || meetingUsagePercent >= 80) && (
          <div className="rounded-lg bg-orange-500/10 p-3 text-sm text-orange-600 dark:text-orange-400">
            You're running low on your free trial. Upgrade to continue creating {agentUsagePercent >= 80 ? "agents" : "meetings"}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
