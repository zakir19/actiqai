"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GSAPAuthBackground from "@/components/auth/gsap-auth-bg";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = authClient.useSession();

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-semibold">Actiq AI</Link>
          <nav className="hidden items-center gap-10 sm:flex sm:gap-16">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="#how" className="text-muted-foreground hover:text-foreground">How it works</Link>
            <Link href="#security" className="text-muted-foreground hover:text-foreground">Security</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {session.user.name}
                </span>
                <Button variant="outline" onClick={() => authClient.signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
            <Button variant="secondary" asChild>
              <Link href="#pricing">View pricing</Link>
            </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/signup">Sign up</Link>
            </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden">
          <GSAPAuthBackground />
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Live AI meeting intelligence
                </div>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Actiq AI — meeting intelligence for enterprise collaboration
                </h1>
                <p className="text-muted-foreground text-lg">
                  Capture every discussion, generate AI summaries and action items, and integrate with
                  Google Meet, Zoom, Microsoft Teams, Slack, Notion, and your CRM.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Button size="lg" className="w-full max-w-xs text-lg py-6" asChild>
                    <Link href="/get-started">Get Started</Link>
                  </Button>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" asChild>
                      <Link href="/signup">Sign up</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="#features">See features</Link>
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Secure cloud processing. Hybrid deployments for privacy-conscious organizations.
                </p>
              </div>
              <div className="relative">
                <div id="hero-image" className="rounded-xl border bg-card p-4 shadow-sm">
                  <Image src="/logo.png" alt="Actiq AI" width={800} height={600} className="w-full" />
                </div>
                <div className="pointer-events-none absolute -right-8 -top-8 hidden rotate-6 sm:block">
                  <div className="rounded-xl border bg-card p-2 shadow-sm">
                    <Image src="/logo.png" alt="Actiq AI window" width={260} height={180} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="rounded-md border px-3 py-1">Trusted by distributed teams</span>
              <span className="rounded-md border px-3 py-1">SOC 2 in progress</span>
              <span className="rounded-md border px-3 py-1">GDPR-ready</span>
              <span className="rounded-md border px-3 py-1">SSO / SAML</span>
            </div>
          </div>
        </section>

        <section id="features" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything your meetings need</h2>
              <p className="text-muted-foreground mt-3">
                Real-time transcription, AI-powered summaries, action item extraction, speaker ID, and collaborative notes.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time transcription</CardTitle>
                  <CardDescription>Accurate live captions powered by modern speech engines.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Works across major video platforms with domain-tuned models for clarity.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI summaries</CardTitle>
                  <CardDescription>Custom prompts reflect your internal workflows.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Generate concise briefs, decisions, risks, and follow-ups instantly.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Action items</CardTitle>
                  <CardDescription>Auto-extract owners, due dates, and next steps.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Push to Jira, Asana, Trello, or your CRM with a click.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Speaker identification</CardTitle>
                  <CardDescription>Know who said what and when.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Accurate diarization with organizational directories for better context.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Keyword highlights</CardTitle>
                  <CardDescription>Surface key moments automatically.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Jump to decisions, risks, metrics, and blockers from transcripts.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collaborative notes</CardTitle>
                  <CardDescription>Capture shared context in one place.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Real-time editing with role-based access and version history.
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 grid items-center gap-6 sm:grid-cols-2">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <Image src="/logo.png" alt="Transcript and highlights" width={900} height={640} className="w-full" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Beautiful summaries and actionable insights</h3>
                <p className="text-muted-foreground">
                  Actiq AI turns conversation into decisions, owners, and next steps. Customize the output with prompts that reflect your workflow.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="rounded-lg border p-3">
                    <div className="font-medium text-foreground">Decisions</div>
                    Key calls, risks, dependencies.
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="font-medium text-foreground">Action items</div>
                    Owners, due dates, next steps.
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="font-medium text-foreground">Highlights</div>
                    Keywords and key moments.
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="font-medium text-foreground">Integrations</div>
                    Sync to Slack, Notion, CRM.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
              <p className="text-muted-foreground mt-3">Deploy in days, scale across the organization.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>1. Connect</CardTitle>
                  <CardDescription>Link video platforms, calendars, and chat tools.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">SSO, SCIM, role-based access ready.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. Capture</CardTitle>
                  <CardDescription>Transcribe and analyze conversations in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Speaker ID, keywords, decisions, and risks.</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Act</CardTitle>
                  <CardDescription>Push action items to where work happens.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">Sync to Slack, Notion, Jira, and CRM.</CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="security" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="grid items-start gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Security and privacy</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with least-privilege access. Data encrypted in transit and at rest.
                  Optional regional data residency and hybrid deployments.
                </p>
                <ul className="text-muted-foreground grid list-disc gap-2 pl-5 text-sm">
                  <li>SSO/SAML, SCIM user provisioning</li>
                  <li>Audit logs, role-based access controls</li>
                  <li>PII redaction and retention policies</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Enterprise-ready integrations</h3>
                <p className="text-muted-foreground">
                  Connect to Google Meet, Zoom, Microsoft Teams, Slack, Notion, Salesforce, and more.
                  Build on our APIs and webhooks to extend Actiq AI in your workflows.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-md border px-3 py-1 text-sm">Google Meet</span>
                  <span className="rounded-md border px-3 py-1 text-sm">Zoom</span>
                  <span className="rounded-md border px-3 py-1 text-sm">Microsoft Teams</span>
                  <span className="rounded-md border px-3 py-1 text-sm">Slack</span>
                  <span className="rounded-md border px-3 py-1 text-sm">Notion</span>
                  <span className="rounded-md border px-3 py-1 text-sm">Salesforce</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, scalable pricing</h3>
              <p className="text-muted-foreground mt-3">Start free. Upgrade as you scale.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>For small teams getting started</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="text-3xl font-semibold">$0</div>
                  <ul className="text-muted-foreground mt-4 grid list-disc gap-2 pl-5">
                    <li>Up to 5 users</li>
                    <li>Transcription and summaries</li>
                    <li>Basic integrations</li>
                  </ul>
                  <div className="mt-6">
                    <Button className="w-full" asChild>
                      <Link href="/signup">Get started</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Growth</CardTitle>
                  <CardDescription>For fast-growing teams</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="text-3xl font-semibold">$29<span className="text-base font-normal">/user</span></div>
                  <ul className="text-muted-foreground mt-4 grid list-disc gap-2 pl-5">
                    <li>Unlimited users</li>
                    <li>Action items and speaker ID</li>
                    <li>Advanced integrations</li>
                  </ul>
                  <div className="mt-6">
                    <Button className="w-full" asChild>
                      <Link href="/signup">Start trial</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>Bespoke security and support</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="text-3xl font-semibold">Custom</div>
                  <ul className="text-muted-foreground mt-4 grid list-disc gap-2 pl-5">
                    <li>SSO/SAML, SCIM</li>
                    <li>Data residency and hybrid</li>
                    <li>Dedicated support and SLAs</li>
                  </ul>
                  <div className="mt-6">
                    <Button variant="secondary" className="w-full" asChild>
                      <Link href="#">Contact sales</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 grid items-center gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold">Why teams choose Actiq AI</h4>
                <ul className="text-muted-foreground grid list-disc gap-2 pl-5 text-sm">
                  <li>Enterprise-grade security and privacy controls</li>
                  <li>Reliable AI summaries grounded in transcripts</li>
                  <li>Seamless integrations with your existing tools</li>
                </ul>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="grid grid-cols-3 gap-4 opacity-80">
                  <Image src="/logo.png" alt="Actiq AI" width={120} height={120} />
                  <Image src="/logo.png" alt="Actiq AI" width={120} height={120} />
                  <Image src="/logo.png" alt="Actiq AI" width={120} height={120} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">Loved by teams</h3>
              <p className="text-muted-foreground mt-3">What customers say about Actiq AI</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6 text-sm">
                  “Actiq AI turned chaotic meetings into clear action plans. The summaries are spot on.”
                  <div className="mt-4 text-muted-foreground">— Product Lead, SaaS</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm">
                  “Security features fit our compliance needs. Deployment took less than a week.”
                  <div className="mt-4 text-muted-foreground">— IT Director, Fintech</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-sm">
                  “Seamless integration with Slack and Notion. Our teams actually use it.”
                  <div className="mt-4 text-muted-foreground">— Ops Manager, Enterprise</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h3>
              <p className="text-muted-foreground mt-3">Everything you need to know</p>
            </div>
            <div className="mx-auto mt-8 max-w-2xl">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger>How does Actiq AI handle data security?</AccordionTrigger>
                  <AccordionContent>
                    We encrypt data in transit and at rest, support SSO/SAML, and provide RBAC and audit logs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>Can we customize AI summaries?</AccordionTrigger>
                  <AccordionContent>
                    Yes. Use custom prompts to mirror your workflows and emphasis areas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>Do you support hybrid deployments?</AccordionTrigger>
                  <AccordionContent>
                    We support hybrid models for privacy-sensitive organizations and regional data residency.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
            <div className="rounded-xl border bg-gradient-to-br from-secondary to-background p-8 text-center">
              <h3 className="text-2xl font-semibold">Ready to transform your meetings?</h3>
              <p className="text-muted-foreground mt-2">
                Start with a secure trial and deploy organization-wide in days.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button asChild>
                  <Link href="/signup">Start free</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="#">Contact sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 sm:grid-cols-4">
          <div className="space-y-2">
            <div className="font-semibold">Actiq AI</div>
            <p className="text-muted-foreground text-sm">Meeting intelligence for enterprises.</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium">Product</div>
            <ul className="mt-2 grid gap-2 text-muted-foreground">
              <li><Link href="#features">Features</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="#security">Security</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-medium">Company</div>
            <ul className="mt-2 grid gap-2 text-muted-foreground">
              <li><Link href="#">Contact</Link></li>
              <li><Link href="#">Status</Link></li>
              <li><Link href="#">Privacy</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="font-medium">Resources</div>
            <ul className="mt-2 grid gap-2 text-muted-foreground">
              <li><Link href="#how">How it works</Link></li>
              <li><Link href="#">Docs</Link></li>
              <li><Link href="#">Changelog</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Actiq AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
