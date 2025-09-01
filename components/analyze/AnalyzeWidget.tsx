"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Section = { title: string; bullets: string[] }
type ApiResp = {
  metrics: {
    rangeDays: number
    startDate: string
    endDate: string
    totals: { income: number; expense: number; profit: number; avgDailyProfit: number }
  }
  insightsJSON: { sections: Section[] }
  usedAI: boolean
  cached?: boolean
}

type Props = {
  className?: string
  maxSections?: number   // limit sections for a compact widget
  maxBullets?: number    // limit bullets per section
}

export default function AnalyzeWidget({ className, maxSections = 3, maxBullets = 4 }: Props) {
  const { companyId } = useParams() as { companyId: string }
  const [data, setData] = useState<ApiResp | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", [])

  async function run(refresh = false) {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/companies/${companyId}/analyze${refresh ? "?refresh=1" : ""}`,
        { method: "POST" }
      )
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { run() }, [companyId])

  return (
    <Card className={cn("w-full", className)} aria-busy={loading}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-0">
        <div>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>
            {data ? `${data.metrics.startDate} → ${data.metrics.endDate}` : "Last 90 days"} · {tz}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => run(!!data)}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="4"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
                Analyzing…
              </span>
            ) : data ? "Regenerate" : "Generate"}
          </Button>
          <Button asChild size="sm" variant="default">
            <Link href={`/companies/${companyId}/analyze`}>Open full</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className={cn(loading && data ? "opacity-70 transition-opacity" : "transition-opacity", "px-0")}>
        {/* error state */}
        {error && (
          <p className="text-sm text-muted-foreground">
            {error}
          </p>
        )}

        {/* first-load skeleton */}
        {loading && !data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-3 w-3/4" />)}
              </div>
            ))}
          </div>
        )}

        {/* content */}
        {data && (
          <div className="space-y-5">
            {/* compact totals row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStat label="Income" value={`$${data.metrics.totals.income.toFixed(2)}`} />
              <MiniStat label="Expenses" value={`$${data.metrics.totals.expense.toFixed(2)}`} />
              <MiniStat label="Profit" value={`$${data.metrics.totals.profit.toFixed(2)}`} />
              <MiniStat label="Avg Daily" value={`$${data.metrics.totals.avgDailyProfit.toFixed(2)}`} />
            </div>

            {/* sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.insightsJSON.sections.slice(0, maxSections).map((s) => (
                <div key={s.title} className="rounded-xl border p-4">
                  <div className="text-sm font-medium mb-2">{s.title}</div>
                  <ul className="list-disc pl-5 space-y-1 marker:text-muted-foreground">
                    {s.bullets.slice(0, maxBullets).map((b, i) => (
                      <li key={i} className="text-sm leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* footer meta */}
            <div className="text-xs text-muted-foreground">
              {data.cached ? "Served from cache" : "Generated"} · Model: {data.usedAI ? "gpt-4o-mini" : "AI"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold tabular-nums">{value}</div>
    </div>
  )
}
