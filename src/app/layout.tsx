import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteBackground from "@/components/backgrounds/site-bg";

const inter = Inter({
  variable: "--font-inter",
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
        className={`${inter.className} antialiased`}
      >
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
