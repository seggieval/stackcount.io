"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import * as React from "react";

export type AboutMetric = { label: string; value: string };
export type AboutBullet = { title: string; description?: string; icon?: React.ReactNode };
export type AboutCTA = { label: string; href: string; variant?: "default" | "outline" };

export type AboutSectionProps = {
  id?: string; // anchor id (default: 'about')
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  bullets?: AboutBullet[];
  metrics?: AboutMetric[];
  ctas?: AboutCTA[];
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  badges?: string[];
};

/**
 * Responsive "About" section tailored for landing pages using shadcn/ui + Tailwind.
 */
export default function AboutSection({
  id = "about",
  eyebrow = "About the project",
  title = "My first AI API — and the app I built around it",
  subtitle = "stackCount · full-stack · OpenAI GPT integrated",
  description =
    "I'm Kiril Sierykov, an 18-year-old developer. stackCount started as a portfolio project to prove I could ship a real full-stack app — and connecting my first AI API was the hardest part. Getting the OpenAI GPT integration working took real trial and error: API keys, prompt design, structured JSON output, caching responses, and handling failures gracefully. I stuck with it, figured it out, and now the Analyze feature sends 90 days of transaction data to GPT and returns actionable financial insights. That experience is exactly why this project belongs on my resume.",
  bullets = [
    {
      title: "OpenAI GPT API integration",
      description:
        "Production integration with gpt-4o-mini — structured JSON insights, response caching, and error fallbacks.",
      icon: <Sparkles className="size-4" />,
    },
    {
      title: "Full-stack architecture",
      description:
        "Next.js 15 App Router, PostgreSQL via Prisma, NextAuth (Google OAuth + credentials), Stripe donations.",
      icon: <Shield className="size-4" />,
    },
    {
      title: "Shipped end-to-end",
      description:
        "From database schema to deployed Vercel production — auth, payments, AI analysis, and CSV export all working.",
      icon: <CheckCircle2 className="size-4" />,
    },
  ],
  metrics = [
    { label: "Tech stack pieces", value: "8+" },
    { label: "Avg. setup time", value: "≈ 4 min" },
    { label: "AI model", value: "GPT-4o" },
  ],
  ctas = [
    { label: "Try it free", href: "/register", variant: "default" },
    { label: "View my portfolio", href: "https://sierykov.com/", variant: "outline" },
  ],
  imageSrc = "/hero-about.png",
  imageAlt = "stackCount dashboard showing profit analytics and AI insights",
  className,
  badges = ["Next.js 15", "OpenAI GPT", "PostgreSQL", "TypeScript"],
}: AboutSectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        "relative scroll-mt-[var(--header-height,5rem)]",
        "isolate overflow-hidden",
        "pt-20 sm:pt-20",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 xl:col-span-6"
          >
            {eyebrow && (
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="font-medium">
                  {eyebrow}
                </Badge>
                {subtitle && <span className="leading-none">{subtitle}</span>}
              </div>
            )}

            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="mt-4 max-w-prose text-pretty text-muted-foreground">
                {description}
              </p>
            )}

            {/* Bullets */}
            {bullets?.length ? (
              <ul className="mt-6 grid gap-3">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-primary/10 p-1.5 text-primary">
                      {b.icon ?? <CheckCircle2 className="size-4" />}
                    </div>
                    <div>
                      <p className="font-medium leading-6">{b.title}</p>
                      {b.description && (
                        <p className="text-sm text-muted-foreground">{b.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {/* CTAs */}
            {ctas?.length ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {ctas.map((c, i) => (
                  <Button key={i} asChild variant={c.variant ?? "default"}>
                    <a href={c.href}>{c.label}</a>
                  </Button>
                ))}
              </div>
            ) : null}

            {/* Badges row */}
            {badges?.length ? (
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {badges.map((b, i) => (
                  <span key={i} className="rounded-full border px-2 py-1">
                    {b}
                  </span>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* Visual / Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="lg:col-span-6 xl:col-span-6"
          >
            <div className="grid gap-6">
              <Card className="overflow-hidden py-0">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 600px, 100vw"
                      priority={false}
                    />
                  </div>
                </CardContent>
              </Card>

              {metrics?.length ? (
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {metrics.map((m, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="text-2xl font-semibold tabular-nums">
                          {m.value}
                        </div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
