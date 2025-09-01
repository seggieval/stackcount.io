"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

const featuresBasic = [
  "Track income & expenses (pretend to budget)",
  "Visual profit charts that sometimes go up",
  "Unlimited fake companies for your empire",
  "Secure-ish cloud storage (I ran npm audit)",
  "Category insights you’ll ignore later",
  "Merchant stats: yes, it’s mostly coffee",
  "Export to CSV (for that one accountant friend)",
]

const featuresSupport = [
  "Everything in Free (obviously)",
  "Directly support the dev ❤️ (buys more useless stuff)",
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
  { headline = "Pricing that’s not really pricing",
    subhead = "It’s free. The other plan is you being a legend and tossing a donation.",
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
      {/* Basic Plan */}
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
                All the core stuff.
                <span className="font-semibold"> $0 forever.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground mt-2">Because this is a portfolio, not a payroll.</p>
              <FeatureList features={featuresBasic} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled className="w-full">
                Already on this plan
              </Button>
            </CardFooter>
          </Card>

          {/* Support Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Support (Be a legend)</CardTitle>
              <CardDescription>
                Keep the lights on & fuel internship dreams.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold">Your choice</div>
              <p className="text-muted-foreground mt-2">
                No extra features — just good karma and maybe faster bug fixes.
              </p>
              <FeatureList features={featuresSupport} />
            </CardContent>
            <CardFooter>
              <Link className="w-full" href="/donate">
                <Button className="w-full">Donate (flex)</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </section>
  )
}
