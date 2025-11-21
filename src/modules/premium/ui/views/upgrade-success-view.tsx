"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Zap, Loader2 } from "lucide-react";
import { getUserUsageAndPlan } from "../../server/procedures";
import gsap from "gsap";

interface UpgradeSuccessViewProps {
  userData: Awaited<ReturnType<typeof getUserUsageAndPlan>>;
}

export function UpgradeSuccessView({ userData }: UpgradeSuccessViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [syncing, setSyncing] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const plan = userData.user.plan || "free";
  const planName = plan === "monthly" ? "Monthly" : plan === "yearly" ? "Yearly" : "Enterprise";
  const limits = userData.limits;

  useEffect(() => {
    // Sync subscription from Polar
    const syncSubscription = async () => {
      try {
        const response = await fetch("/api/sync-subscription", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to sync subscription");
        }

        console.log("✅ Subscription synced:", data);

        // Wait a bit then reload to get updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("❌ Error syncing subscription:", error);
        setSyncError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setSyncing(false);
      }
    };

    // Only sync if still on free plan (means not synced yet)
    if (plan === "free") {
      syncSubscription();
    } else {
      setSyncing(false);
    }
  }, [plan]);

  useEffect(() => {
    if (syncing) return;

    // GSAP animations
    const tl = gsap.timeline();

    // Card entrance
    tl.from(cardRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    });

    // Check icon animation
    tl.from(
      checkRef.current,
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      },
      "-=0.2"
    );

    // Content fade in
    tl.from(
      contentRef.current,
      {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.3"
    );

    // Sparkle effect
    gsap.to(checkRef.current, {
      filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))",
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, [syncing]);

  const getLimitsText = () => {
    if (plan === "monthly") {
      return {
        agents: "15 AI Agents",
        meetings: "15 Meetings per month",
      };
    } else if (plan === "yearly") {
      return {
        agents: "Unlimited AI Agents",
        meetings: "Unlimited Meetings",
      };
    } else {
      return {
        agents: "Custom AI Agents",
        meetings: "Custom Meetings",
      };
    }
  };

  const limitsText = getLimitsText();

  // Show loading state while syncing
  if (syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <h2 className="text-2xl font-bold">Setting up your subscription...</h2>
            <p className="text-muted-foreground">Please wait while we activate your plan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if sync failed
  if (syncError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold">Sync Error</h2>
            <p className="text-muted-foreground">{syncError}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card
        ref={cardRef}
        className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 animate-pulse" />

        <CardContent className="p-12 relative z-10">
          {/* Success Icon */}
          <div ref={checkRef} className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle2 className="w-24 h-24 text-green-500 relative" strokeWidth={2} />
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="text-center space-y-6">
            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
                Successfully Subscribed!
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome to the <span className="font-semibold text-foreground">{planName} Plan</span>
              </p>
            </div>

            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="font-semibold text-lg">{limitsText.agents}</p>
                </div>
                <p className="text-sm text-muted-foreground">Create powerful AI agents</p>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <p className="font-semibold text-lg">{limitsText.meetings}</p>
                </div>
                <p className="text-sm text-muted-foreground">Schedule AI-powered meetings</p>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-muted/50 rounded-lg p-6 text-left space-y-3">
              <p className="font-semibold text-center mb-4">Your plan includes:</p>
              <ul className="space-y-2">
                {plan === "monthly" ? (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>15 AI Agents & 15 Meetings per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Real-time voice calls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Call recordings & transcripts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Priority support</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Unlimited AI Agents & Meetings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Real-time voice calls</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Call recordings & transcripts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>Advanced analytics</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                onClick={() => router.push("/meetings")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/agents")}
              >
                Create Your First Agent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
