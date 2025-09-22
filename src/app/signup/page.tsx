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

export default function SignupPage() {
    const { data: session } = authClient.useSession();
    // Simplified flow: create account, then sign in. No OTP step with current auth setup.
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!cardRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 24, rotateX: 6 },
                { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: "power3.out" }
            );
        });
        return () => ctx.revert();
    }, []);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            window.alert("Please fill all fields");
            return;
        }
        setLoading(true);
        authClient.signUp.email(
            { email, name, password },
            {
                onError: () => {
                    setLoading(false);
                    window.alert("Sign up failed");
                },
                onSuccess: () => {
                    setLoading(false);
                    window.alert("Account created successfully!");
                    // Redirect to home page
                    window.location.href = "/";
                },
            }
        );
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
                    <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
                    <p className="text-muted-foreground mt-1">Sign up to start using Actiq AI</p>
                </div>
                <Card ref={cardRef} data-auth-card className="mt-5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Create your account</CardTitle>
                        <CardDescription>Use your work email and a secure password</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input id="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Work email</Label>
                                <Input id="email" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button className="w-full" onClick={handleSignup} disabled={loading}>
                                {loading ? "Creating..." : "Create account"}
                            </Button>
                            <div className="my-1"><Separator /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => authClient.signIn.social({ provider: "google" })}>Google</Button>
                                <Button variant="outline" onClick={() => authClient.signIn.social({ provider: "github" })}>Github</Button>
                            </div>
                            <p className="text-muted-foreground text-center text-sm">
                                Already have an account? <Link className="underline" href="/login">Sign in</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex items-center justify-center">
                    {/* <Image src="/logo.png" alt="Actiq AI" width={80} height={80} className="opacity-90" /> */}
                </div>
            </div>
        </div>
    );
}


