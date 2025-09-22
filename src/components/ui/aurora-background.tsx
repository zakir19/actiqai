"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute -inset-[10px] opacity-50 will-change-transform pointer-events-none",
              "animate-aurora blur-[10px]",
              showRadialGradient && "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
            )}
            style={{
              background: `
                repeating-linear-gradient(100deg, 
                  rgba(255,255,255,1) 0%, rgba(255,255,255,1) 7%, 
                  transparent 10%, transparent 12%, 
                  rgba(255,255,255,1) 16%),
                repeating-linear-gradient(100deg, 
                  #3b82f6 10%, #6366f1 15%, 
                  #60a5fa 20%, #a78bfa 25%, 
                  #3b82f6 30%)
              `,
              backgroundSize: '300%, 200%',
              backgroundPosition: '50% 50%, 50% 50%',
              filter: 'blur(10px)',
              animation: 'aurora 60s linear infinite'
            }}
          />
        </div>
        {children}
      </div>
    </main>
  );
};
