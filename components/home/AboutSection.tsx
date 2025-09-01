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
 * Only the text below was changed (sarcastic portfolio vibes). Structure untouched.
 */
export default function AboutSection({
  id = "about",
  eyebrow = "About (but like, ironically)",
  title = "One guy, one laptop, several questionable life choices",
  subtitle = "stackCount • free, donation-supported, internship-bait",
  description =
  "Hi, I’m Kiril — an 18-year-old building a ‘totally serious’ AI accountant mostly to prove I can ship. Use it for your money stuff. Or don’t. I’ll still put it on my resume.",
  bullets = [
    {
      title: "Privacy-first (scouts honor)",
      description: "Your data isn’t my business model. I don’t even have a business model.",
      icon: <Shield className="size-4" />,
    },
    {
      title: "Actionable(ish) insights",
      description: "If a chart tells you to stop buying iced lattes, that’s between you and the chart.",
      icon: <Sparkles className="size-4" />,
    },
    {
      title: "Setup in minutes",
      description: "Import a CSV, press a button, pretend you ‘automated finance’. Boom.",
      icon: <CheckCircle2 className="size-4" />,
    },
  ],
  metrics = [
    { label: "People who said “nice”", value: "7" },
    { label: "Avg. setup time", value: "≈ 4 min" },
    { label: "Bugs I’ll admit publicly", value: "0" },
  ],
  ctas = [
    { label: "Use it (free)", href: "/register", variant: "default" },
    { label: "Hire me as an intern", href: "/about", variant: "outline" },
  ],
  imageSrc = "/hero-about.png",
  imageAlt = "Absolutely real, definitely not staged product screenshot",
  className,
  badges = ["Indie built", "Sleep optional", "Made with ✌️🦅 energy"],
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
