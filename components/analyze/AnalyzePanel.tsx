// components/analyze/AnalyzePanel.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "../ui/skeleton"
import { IconSparkles } from "@tabler/icons-react"

type Section = { title: string; bullets: string[] }
type ApiResp = {
  metrics: {
    rangeDays: number
    startDate: string
    endDate: string
    totals: { income: number; expense: number; profit: number; avgDailyProfit: number }
    wow: { profit7d: number; prevProfit7d: number; delta: number; pct: number }
    trend: { slope: number; volatility: number; maxDrawdown: number }
  }
  insightsJSON: { sections: Section[] }
  usedAI: boolean
}

export default function AnalyzePanel() {
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

  const totals = data?.metrics.totals

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-title font-semibold flex items-center gap-2 mb-1">
            <IconSparkles className="size-5" />
            AI Analyze
          </h2>
          <p className="text-muted-foreground">
            AI insights for the last {data?.metrics.rangeDays ?? 90} days · {tz}
          </p>
        </div>
        <Button
          onClick={() => run(!!data)} // if we already have data → force refresh
          disabled={loading}
        >
          {loading ? "Analyzing…" : data ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <Card>
          <CardHeader><CardTitle>AI temporarily unavailable</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      )}

      {/* SKELETON — show when loading and there's no data yet */}
      {loading && !data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-3/4" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT */}
      {data && (
        <>
          {/* Totals header */}
          <Card className={loading ? "opacity-30 transition-opacity" : "transition-opacity"}>
            <CardHeader>
              <CardTitle>Bottom line</CardTitle>
              <CardDescription>{data.metrics.startDate} → {data.metrics.endDate}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border p-4">
                <div className="text-xs text-muted-foreground">Income</div>
                <div className="text-lg font-semibold tabular-nums">${totals!.income.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-xs text-muted-foreground">Expenses</div>
                <div className="text-lg font-semibold tabular-nums">${totals!.expense.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-xs text-muted-foreground">Profit</div>
                <div className="text-lg font-semibold tabular-nums">${totals!.profit.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-xs text-muted-foreground">Avg Daily</div>
                <div className="text-lg font-semibold tabular-nums">${totals!.avgDailyProfit.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Cards grid */}
          <div className={`grid grid-cols-1 xl:grid-cols-2 gap-4 ${loading ? "opacity-30 transition-opacity" : "transition-opacity"}`}>
            {data.insightsJSON.sections.map((s) => (
              <Card key={s.title}>
                <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <ul className="list-disc pl-5 space-y-1 marker:text-muted-foreground">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="text-sm leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
