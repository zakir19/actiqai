"use client";

export default function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -inset-[10px] opacity-30 will-change-transform pointer-events-none animate-aurora site-bg-gradient blur-[20px]" />
    </div>
  );
}
