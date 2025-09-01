"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  Building2,
  Cloud,
  Download,
  FileSpreadsheet,
  Lock,
  PieChart,
  Wallet,
  type Icon as LucideIcon,
} from "lucide-react"
import { motion } from "framer-motion"

type Feature = {
  title: string
  description: string
  icon: LucideIcon
}

const defaultFeatures: Feature[] = [
  {
    title: "Track income & expenses",
    description: "Or just stare at numbers until they look impressive on LinkedIn.",
    icon: Wallet,
  },
  {
    title: "Profit analytics",
    description: "Charts that prove I can import Recharts without crying.",
    icon: PieChart,
  },
  {
    title: "Multi-company workspaces",
    description: "Because running one fake startup wasn’t enough.",
    icon: Building2,
  },
  {
    title: "AI-assisted insights",
    description: "Basically ChatGPT whispering, 'maybe stop eating out so much.'",
    icon: BarChart3,
  },
  {
    title: "CSV import / export",
    description: "Upload chaos, download chaos — portfolio points secured.",
    icon: FileSpreadsheet,
  },
  {
    title: "Privacy & security",
    description: "I once ran `npm audit fix` so you know it’s safe.",
    icon: Lock,
  },
  {
    title: "Cloud backups",
    description: "Totally not just sitting in a free Neon Postgres tier.",
    icon: Cloud,
  },
  {
    title: "One-click exports",
    description: "For when recruiters demand proof this app actually exists.",
    icon: Download,
  },
]

export function FeatureSection({
  id = "features",
  headline = "Totally serious features (wink wink).",
  subhead = "Everything you’d expect from a billion-dollar SaaS — except it’s just me, coding for an internship.",
  features = defaultFeatures,
  className,
}: {
  id?: string
  headline?: string
  subhead?: string
  features?: Feature[]
  className?: string
}) {
  return (
    <section id={id} className={cn("w-full py-20 pb-0 md:py-28 relative isolate overflow-hidden", className)}>
      {/* background wash */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/40 to-transparent" />
        <div className="absolute -top-24 left-1/2 h-64 w-[60rem] -translate-x-1/2 rounded-full blur-3xl bg-primary/10" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}>
        <div className="container">
          <div className="mb-10 text-center">
            <Badge variant="outline" className="mb-3">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{headline}</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{subhead}</p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="group relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-card group-hover:scale-105 transition-transform">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
