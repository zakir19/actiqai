"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { authClient } from "@/lib/auth-client";
import { Spotlight } from "@/components/ui/spotlight";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { LampContainer } from "@/components/ui/lamp";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  Bot, 
  FileText, 
  Video, 
  Lock,
  Globe,
  TrendingUp 
} from "lucide-react";

export default function Home() {
  const { data: session } = authClient.useSession();

  const testimonials = [
    {
      quote: "Actiq AI turned chaotic meetings into clear action plans. The summaries are spot on and save us hours every week.",
      name: "Sarah Chen",
      title: "Product Lead, SaaS Startup",
    },
    {
      quote: "Security features fit our compliance needs perfectly. Deployment took less than a week and the team loves it.",
      name: "Michael Rodriguez",
      title: "IT Director, Fintech",
    },
    {
      quote: "Seamless integration with Slack and Notion. Our teams actually use it daily, which is rare for new tools.",
      name: "Emily Thompson",
      title: "Ops Manager, Enterprise",
    },
    {
      quote: "The AI summaries are incredibly accurate. It's like having a dedicated note-taker in every meeting.",
      name: "David Park",
      title: "Engineering Manager, Tech Co",
    },
    {
      quote: "Action items are automatically extracted and synced to our project management tools. Game changer!",
      name: "Lisa Anderson",
      title: "Project Manager, Agency",
    },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Reveal sections on scroll
    const sections = Array.from(document.querySelectorAll("section"));
    gsap.set(sections, { opacity: 0, y: 24 });
    sections.forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.1 + i * 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
      });
    });

    // Subtle hero image float
    const hero = document.querySelector("#hero-image");
    if (hero) {
      gsap.to(hero, { y: -6, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
            <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            Actiq AI
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            <Link href="#features" className="text-slate-400 hover:text-white transition-colors font-medium">Features</Link>
            <Link href="#how" className="text-slate-400 hover:text-white transition-colors font-medium">How it works</Link>
            <Link href="#security" className="text-slate-400 hover:text-white transition-colors font-medium">Security</Link>
            <Link href="#pricing" className="text-slate-400 hover:text-white transition-colors font-medium">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-slate-400">
                  Welcome, <span className="font-semibold text-white">{session.user.name}</span>
                </span>
                <Button variant="outline" onClick={() => authClient.signOut()} className="border-slate-700 hover:bg-slate-800 text-slate-300">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-slate-400 hover:text-white">
                  <Link href="#pricing">View pricing</Link>
                </Button>
                <Button variant="outline" asChild className="border-slate-700 hover:bg-slate-800 text-slate-300">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero Section - UnKey Style */}
        <section className="relative overflow-hidden border-b border-slate-700 bg-slate-950 min-h-[90vh] flex items-center">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 relative z-10 w-full">
            <div className="text-center space-y-12">
              {/* Main Heading - Large and Bold */}
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white leading-tight">
                  The Meeting Platform
                  <br />
                  <span className="text-slate-400">for Modern Teams</span>
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-400 max-w-4xl mx-auto leading-relaxed">
                Easily integrate necessary meeting features like AI summaries, action items,
                and real-time transcription, ensuring your meetings are ready to scale.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 text-base px-8 py-6 rounded-lg font-semibold shadow-lg" asChild>
                  <Link href="/meetings">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get started
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="text-white hover:bg-slate-800 text-base px-8 py-6 rounded-lg font-semibold border border-slate-700" asChild>
                  <Link href="#features">
                    <FileText className="mr-2 h-5 w-5" />
                    Documentation
                  </Link>
                </Button>
              </div>

              {/* Dashboard Preview */}
              <div className="pt-12 max-w-6xl mx-auto">
                <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl">
                  <Image src="/logo.png" alt="Actiq AI Dashboard" width={1200} height={800} className="w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1">Trusted by distributed teams</span>
              <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1">SOC 2 in progress</span>
              <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1">GDPR-ready</span>
              <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1">SSO / SAML</span>
            </div>
          </div>
        </section>

        {/* Features Section with Bento Grid */}
        <section id="features" className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Everything your meetings need
              </h2>
              <p className="text-xl text-slate-400 mt-6 leading-relaxed">
                Real-time transcription, AI-powered summaries, action item extraction, speaker ID, and collaborative notes.
              </p>
            </div>

            <BentoGrid className="max-w-6xl mx-auto">
              <BentoGridItem
                title="Real-time Transcription"
                description="Accurate live captions powered by modern speech engines across all platforms."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                }
                icon={<Zap className="h-4 w-4 text-blue-500" />}
                className="md:col-span-2"
              />
              <BentoGridItem
                title="AI Summaries"
                description="Custom prompts reflect your internal workflows with instant briefs."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center">
                    <Bot className="h-12 w-12 text-white" />
                  </div>
                }
                icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                className="md:col-span-1"
              />
              <BentoGridItem
                title="Action Items"
                description="Auto-extract owners, due dates, and next steps with CRM integration."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 items-center justify-center">
                    <FileText className="h-12 w-12 text-white" />
                  </div>
                }
                icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                className="md:col-span-1"
              />
              <BentoGridItem
                title="Speaker Identification"
                description="Know who said what with accurate diarization and org directories."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-500 to-red-500 items-center justify-center">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                }
                icon={<Users className="h-4 w-4 text-orange-500" />}
                className="md:col-span-2"
              />
              <BentoGridItem
                title="Enterprise Security"
                description="SOC 2, GDPR-ready, SSO/SAML with audit logs and role-based access."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 items-center justify-center">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                }
                icon={<Lock className="h-4 w-4 text-cyan-500" />}
                className="md:col-span-1"
              />
              <BentoGridItem
                title="Global Integrations"
                description="Connect to Google Meet, Zoom, Teams, Slack, Notion, and your CRM."
                header={
                  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 items-center justify-center">
                    <Globe className="h-12 w-12 text-white" />
                  </div>
                }
                icon={<Globe className="h-4 w-4 text-indigo-500" />}
                className="md:col-span-2"
              />
            </BentoGrid>
          </div>
        </section>

        <section id="how" className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">How it works</h2>
              <p className="text-slate-400 mt-3">Deploy in days, scale across the organization.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">1. Connect</CardTitle>
                  <CardDescription className="text-slate-400">Link video platforms, calendars, and chat tools.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-400">SSO, SCIM, role-based access ready.</CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">2. Capture</CardTitle>
                  <CardDescription className="text-slate-400">Transcribe and analyze conversations in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-400">Speaker ID, keywords, decisions, and risks.</CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">3. Act</CardTitle>
                  <CardDescription className="text-slate-400">Push action items to where work happens.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-400">Sync to Slack, Notion, Jira, and CRM.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="security" className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="grid items-start gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white">Security and privacy</h3>
                <p className="text-slate-400">
                  Enterprise-grade security with least-privilege access. Data encrypted in transit and at rest.
                  Optional regional data residency and hybrid deployments.
                </p>
                <ul className="text-slate-400 grid list-disc gap-2 pl-5 text-sm">
                  <li>SSO/SAML, SCIM user provisioning</li>
                  <li>Audit logs, role-based access controls</li>
                  <li>PII redaction and retention policies</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-white">Enterprise-ready integrations</h3>
                <p className="text-slate-400">
                  Connect to Google Meet, Zoom, Microsoft Teams, Slack, Notion, Salesforce, and more.
                  Build on our APIs and webhooks to extend Actiq AI in your workflows.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">Google Meet</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">Zoom</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">Microsoft Teams</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">Slack</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">Notion</span>
                  <span className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-300">Salesforce</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section with Lamp Effect */}
        <section id="pricing" className="border-b border-slate-200 dark:border-slate-700 relative overflow-hidden bg-slate-950">
          <LampContainer className="min-h-screen py-20">
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="bg-linear-to-br from-white to-slate-300 py-4 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl"
            >
              Simple, scalable pricing
            </motion.h1>
            <p className="text-slate-300 text-center mt-6 text-xl mb-12 font-medium">Start free. Upgrade as you scale.</p>
            
            <div className="grid gap-8 sm:grid-cols-3 max-w-6xl mx-auto px-4 relative z-50">
              {/* Starter Plan */}
              <Card className="relative overflow-hidden border-2 border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-white">Starter</CardTitle>
                  <CardDescription className="text-slate-300 text-base mt-2">For small teams getting started</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-6">
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-white">$0</div>
                    <p className="text-slate-400">Free forever</p>
                  </div>
                  <ul className="text-slate-300 space-y-3 text-base">
                    <li className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Up to 5 users</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Transcription and summaries</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Basic integrations</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Button className="w-full h-12 text-base font-semibold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg" asChild>
                      <Link href="/signup">Get started</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Plan - Featured */}
              <Card className="relative overflow-hidden border-2 border-cyan-500 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/30 scale-105 hover:scale-110 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-linear-to-r from-cyan-500 to-blue-500 text-white text-sm px-4 py-2 rounded-bl-xl font-bold shadow-lg">
                  ⭐ POPULAR
                </div>
                <CardHeader className="pb-4 pt-8">
                  <CardTitle className="text-2xl font-bold text-white">Growth</CardTitle>
                  <CardDescription className="text-slate-200 text-base mt-2 font-medium">For fast-growing teams</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">$29</span>
                      <span className="text-xl font-medium text-slate-300">/user</span>
                    </div>
                    <p className="text-slate-300">Per month, billed annually</p>
                  </div>
                  <ul className="text-slate-200 space-y-3 text-base">
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Unlimited users</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Action items and speaker ID</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Advanced integrations</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Button className="w-full h-12 text-base font-semibold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/50" asChild>
                      <Link href="/signup">Start trial</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative overflow-hidden border-2 border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-white">Enterprise</CardTitle>
                  <CardDescription className="text-slate-300 text-base mt-2">Bespoke security and support</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-6">
                  <div className="space-y-2">
                    <div className="text-5xl font-bold text-white">Custom</div>
                    <p className="text-slate-400">Tailored to your needs</p>
                  </div>
                  <ul className="text-slate-300 space-y-3 text-base">
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>SSO/SAML, SCIM</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Data residency and hybrid</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Dedicated support and SLAs</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full h-12 text-base font-semibold border-2 border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-black" asChild>
                      <Link href="#">Contact sales</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </LampContainer>
        </section>

        {/* Testimonials with Infinite Moving Cards */}
        <section className="border-b border-slate-800 bg-slate-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center mb-12">
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">Loved by teams worldwide</h3>
              <p className="text-slate-400 mt-3">What customers say about Actiq AI</p>
            </div>
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </section>

        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl text-white">Frequently asked questions</h3>
              <p className="text-slate-400 mt-3">Everything you need to know</p>
            </div>
            <div className="mx-auto mt-8 max-w-2xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1" className="border-slate-800">
                  <AccordionTrigger className="text-white hover:text-slate-300">How does Actiq AI handle data security?</AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    We encrypt data in transit and at rest, support SSO/SAML, and provide RBAC and audit logs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2" className="border-slate-800">
                  <AccordionTrigger className="text-white hover:text-slate-300">Can we customize AI summaries?</AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    Yes. Use custom prompts to mirror your workflows and emphasis areas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3" className="border-slate-800">
                  <AccordionTrigger className="text-white hover:text-slate-300">Do you support hybrid deployments?</AccordionTrigger>
                  <AccordionContent className="text-slate-400">
                    We support hybrid models for privacy-sensitive organizations and regional data residency.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
              <h3 className="text-2xl font-semibold text-white">Ready to transform your meetings?</h3>
              <p className="text-slate-400 mt-2">
                Start with a secure trial and deploy organization-wide in days.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button className="bg-white text-black hover:bg-slate-200" asChild>
                  <Link href="/signup">Start free</Link>
                </Button>
                <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-white" asChild>
                  <Link href="#">Contact sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 py-16 sm:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-xl text-white">Actiq AI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">Meeting intelligence for enterprises. Transform your meetings into actionable insights.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="border-slate-700 hover:bg-slate-800 text-slate-300">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white mb-4">Product</div>
            <ul className="grid gap-3 text-slate-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="#how" className="hover:text-white transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white mb-4">Company</div>
            <ul className="grid gap-3 text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-white mb-4">Resources</div>
            <ul className="grid gap-3 text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        
        {/* UnKey Style Section at Footer */}
        <div className="border-t border-slate-800 relative overflow-hidden">
          <div className="relative flex items-center justify-center py-20 min-h-[300px]">
            {/* Large Background Text */}
            <h2 className="absolute text-[100px] sm:text-[140px] lg:text-[180px] xl:text-[220px] font-black leading-none tracking-tighter text-center">
              <span className="bg-linear-to-b from-slate-300 via-slate-400 to-slate-700 bg-clip-text text-transparent opacity-10 select-none">
                Actiq AI
              </span>
            </h2>
          </div>
        </div>
      </footer>
    </div>
  );
}
