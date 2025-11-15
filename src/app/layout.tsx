import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next";
import "./globals.css";

import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Actiq AI",
    description: "AI-powered meeting platform with intelligent voice agents",
    icons: {
        icon: "/actiqai.png",
        shortcut: "/actiqai.png",
        apple: "/actiqai.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NuqsAdapter>
            <TRPCReactProvider>
                <html lang="en">
                    <body className={`${inter.className} antialiased`}>
                        <Toaster />
                        {children}
                    </body>
                </html>
            </TRPCReactProvider>
        </NuqsAdapter>
    );
}