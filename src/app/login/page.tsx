"use client";

import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { gsap } from "gsap";
import GSAPAuthBackground from "@/components/auth/gsap-auth-bg";

export default function LoginPage() {
    const { data: session } = authClient.useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!cardRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 24, rotateX: 6 },
                { opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: "power3.out" }
            );
        });
        return () => ctx.revert();
    }, []);

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }
        setLoading(true);
        authClient.signIn.email(
            { email, password },
            {
                onError: () => {
                    setLoading(false);
                    setError("Invalid email or password");
                },
                onSuccess: () => {
                    setLoading(false);
                    setError("");
                },
            }
        );
    };

    const handleSocial = (provider: "google" | "github") => {
        window.location.href = `/api/auth/signin/${provider}`;
    };


    if (session) {
        return (
            <div className="relative mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
                <GSAPAuthBackground />
                <p className="text-lg font-semibold">You are already signed in.</p>
                <Button onClick={() => authClient.signOut()}>Sign Out</Button>
                <Link href="/" className="text-muted-foreground text-sm underline">Back to home</Link>
            </div>
        );
    }

    return (
        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-md flex-col items-center justify-center p-6">
            <GSAPAuthBackground />
            <div className="w-full">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-muted-foreground mt-1">Login to your account</p>
                </div>
                <Card ref={cardRef} data-auth-card className="mt-5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Sign in</CardTitle>
                        <CardDescription>Use your email and password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-100/60 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                        <div className="my-1"><Separator /></div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" onClick={() => handleSocial("google")}>Google</Button>
                            <Button variant="outline" onClick={() => handleSocial("github")}>Github</Button>
                        </div>
                        <p className="text-muted-foreground text-center text-sm">
                            Don&apos;t have an account? <Link className="underline" href="/signup">Sign up</Link>
                        </p>
                    </CardContent>
                </Card>
                <div className="mt-6 flex items-center justify-center">
                    {/* <Image src="/logo.png" alt="Actiq AI" width={80} height={80} className="opacity-90" /> */}
                </div>
            </div>
        </div>
    );
}


