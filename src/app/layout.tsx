import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteBackground from "@/components/backgrounds/site-bg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Actiq AI — Meeting Intelligence for Enterprises",
  description:
    "Actiq AI captures, summarizes, and operationalizes meetings with real-time transcription, AI summaries, action items, and deep integrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
