"use client";
import React from "react";

export function AuroraTest() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-900">
      <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 animate-aurora blur-[10px]" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">Actiq AI</h1>
          <p className="text-xl">Ai Meeting Intelligence</p>
          <div className="mt-4 text-sm text-gray-300">
            Something is coming up next.
          </div>
        </div>
      </div>
    </div>
  );
}
