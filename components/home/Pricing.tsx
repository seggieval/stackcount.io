"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

const featuresBasic = [
  "Income & expense tracking with categories",
  "Profit charts and daily analytics",
  "Multi-company workspaces",
  "OpenAI GPT-powered financial insights",
  "Google OAuth & secure authentication",
  "CSV import and export",
  "Cloud storage via PostgreSQL",
]

const featuresSupport = [
  "Everything in Free",
  "Support ongoing development",
]

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Pricing(
  { headline = "Simple, honest pricing",
    subhead = "The app is free. Donations are optional and help cover hosting and development time.",
    id = "pricing",
    className = "" }: {
      headline?: string
      subhead?: string
      id?: string
      className?: string
    } = {}
) {
  return (
    <section id={id} className={cn("pt-20", className)}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}>
        <div className="container">
          <div className="mb-3 text-center">
            <Badge variant="outline" className="mb-3">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{headline}</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{subhead}</p>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto pb-0 pt-0 md:py-8 px-4 grid gap-8 sm:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>
                Full access to all features.
                <span className="font-semibold"> $0 forever.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground mt-2">No paywalls, no feature gates.</p>
              <FeatureList features={featuresBasic} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled className="w-full">
                Current plan
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>
                Optional donation to help keep the project running.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold">Your choice</div>
              <p className="text-muted-foreground mt-2">
                Same features — your support covers server costs and development.
              </p>
              <FeatureList features={featuresSupport} />
            </CardContent>
            <CardFooter>
              <Link className="w-full" href="/donate">
                <Button className="w-full">Donate</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </section>
  )
}
