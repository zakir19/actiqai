import { AuroraBackground } from "@/components/ui/aurora-background";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <AuroraBackground className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-transparent">
      <div className="w-full max-w-sm md:max-w-3xl relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">{children}</div>
    </AuroraBackground>
  );
};
export default AuthLayout;

