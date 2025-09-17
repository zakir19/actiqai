"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AuthPage() {
  const { data: session } = authClient.useSession();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const card = document.querySelector("[data-auth-card]");
    if (card) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [mode, step]);

  const onSubmitSignup = () => {
    if (!email || !password) return window.alert("Please fill all required fields");
    setLoading(true);
    authClient.signUp.email(
      { email, name, password },
      {
        onError: () => {
          setLoading(false);
          window.alert("Something went wrong");
        },
        onSuccess: () => {
          setLoading(false);
          setStep(2);
        },
      }
    );
  };

  const onVerifyOtp = () => {
    if (otp.length < 6) return window.alert("Enter the 6-digit code");
    setLoading(true);
    authClient.signIn.email(
      { email, password },
      {
        onError: () => {
          setLoading(false);
          window.alert("Verification failed");
        },
        onSuccess: () => {
          setLoading(false);
          window.alert("Signed in successfully");
        },
      }
    );
  };

  const onLogin = () => {
    if (!email || !password) return window.alert("Enter email and password");
    setLoading(true);
    authClient.signIn.email(
      { email, password },
      {
        onError: () => {
          setLoading(false);
          window.alert("Something went wrong");
        },
        onSuccess: () => {
          setLoading(false);
          window.alert("Logged in successfully");
        },
      }
    );
  };

  if (session) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-semibold">
          Logged in as <span className="text-blue-600">{session.user.name}</span>
        </p>
        <Button onClick={() => authClient.signOut()}>Sign Out</Button>
        <Link href="/" className="text-muted-foreground text-sm underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[80vh] w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 p-6 sm:grid-cols-2">
      <div>
        <div className="text-left sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Create your Actiq AI account</h1>
          <p className="text-muted-foreground mt-2">Sign up to capture meetings, generate summaries, and drive action.</p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode((v as "signup" | "login"))} className="mt-6 w-full max-w-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="login">Sign in</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <Card data-auth-card>
              <CardHeader>
                <CardTitle>Step {step} of 2</CardTitle>
                <CardDescription>
                  {step === 1 ? "Enter your details to create an account" : "Enter the 6-digit code sent to your email"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 ? (
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
                    <Button className="w-full" onClick={onSubmitSignup} disabled={loading}>
                      {loading ? "Creating..." : "Create account"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2 text-center">
                      <div className="text-sm text-muted-foreground">We sent a code to</div>
                      <div className="font-medium">{email}</div>
                    </div>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button className="w-full" onClick={onVerifyOtp} disabled={loading}>
                      {loading ? "Verifying..." : "Verify and continue"}
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                      Didn&#39;t get a code? <button className="underline" onClick={() => window.alert("Code resent")}>Resend</button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card data-auth-card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" onClick={onLogin} disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-muted-foreground mt-4 text-xs">By continuing, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>.</p>
      </div>

      <div>
        <div className="relative">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <Image src="/logo.png" alt="Actiq AI interface" width={800} height={600} className="w-full" />
          </div>
          <div className="pointer-events-none absolute -left-6 -bottom-6 hidden -rotate-6 sm:block">
            <div className="rounded-xl border bg-card p-2 shadow-sm">
              <Image src="/logo.png" alt="Insights" width={240} height={160} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


