"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { X, Zap } from "lucide-react";

interface LimitReachedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: "agents" | "meetings";
  currentLimit: number;
}

export function LimitReachedPopup({ isOpen, onClose, limitType, currentLimit }: LimitReachedPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !popupRef.current || !overlayRef.current) return;

    // GSAP animation timeline
    const tl = gsap.timeline();

    // Animate overlay
    tl.fromTo(
      overlayRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }
    );

    // Animate popup
    tl.fromTo(
      popupRef.current,
      {
        scale: 0.8,
        opacity: 0,
        y: 50,
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      },
      "-=0.2"
    );

    // Pulse the icon
    tl.to(
      ".zap-icon",
      {
        scale: 1.2,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  const handleUpgrade = () => {
    router.push("/upgrade");
  };

  const handleClose = () => {
    if (!popupRef.current || !overlayRef.current) {
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(popupRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: "power2.in",
    });

    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.2,
      },
      "-=0.1"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <Card ref={popupRef} className="relative z-10 w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-muted"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="pb-4 pt-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Zap className="zap-icon h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Free Trial Limit Reached</CardTitle>
          <CardDescription className="text-base">
            You've reached the maximum of {currentLimit} {limitType} for your free trial
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Upgrade to unlock more {limitType} and take your AI communications to the next level with unlimited access and premium features.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Unlimited {limitType === "agents" ? "AI Agents" : "Meetings"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Advanced analytics</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade} className="flex-1">
            Upgrade Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
