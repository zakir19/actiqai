"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuroraBackgroundDemo } from "@/components/ui/aurora-background-demo";

export default function GetStarted() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-semibold">Actiq AI</Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AuroraBackgroundDemo />
      </main>
    </div>
  );
}
