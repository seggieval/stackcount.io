"use client"

import * as React from "react"
import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import Link from "next/link"
import { useParams } from "next/navigation"
import { IconClock } from "@tabler/icons-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"

export const description = "An interactive area chart"

type ProfitPoint = { date: string; profit: number }

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop", color: "var(--primary)" },
  mobile: { label: "Mobile", color: "var(--primary)" },
} satisfies ChartConfig

// --------- HELPERS ---------
const pad = (n: number) => String(n).padStart(2, "0")
const toLocalYMD = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const isYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

/** Safe normalizer: if input is already YYYY-MM-DD, keep it. */
const normalizeDate = (input: string): string => {
  if (isYMD(input)) return input
  return toLocalYMD(new Date(input))
}

/** Format YYYY-MM-DD into "Aug 15" etc (local) */
const labelFromYMD = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1) // local constructor
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
// ----------------------------

export function ChartAreaInteractive(props: React.HTMLAttributes<HTMLDivElement>) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d")
  const [chartData, setChartData] = React.useState<ProfitPoint[]>([])
  const { companyId } = useParams() as { companyId: string }

  React.useEffect(() => {
    const fetchProfitData = async () => {
      const res = await fetch(`/api/companies/${companyId}/profit`, { cache: "no-store" })
      const data: ProfitPoint[] = await res.json()

      setChartData(data.map((it) => ({
        date: normalizeDate(it.date),
        profit: it.profit,
      })))
    }
    fetchProfitData()
  }, [companyId])

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const filteredData = useMemo(() => {
    const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    const start = new Date()
    start.setDate(start.getDate() - days)
    const startStr = toLocalYMD(start)
    return chartData.filter((it) => it.date >= startStr)
  }, [chartData, timeRange])

  return (
    <Card {...props} className={`@container/card ${props.className ?? ""}`}>
      <CardHeader>
        <CardTitle>Profit Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v as typeof timeRange)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="text-muted-foreground h-[150px] w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center pb-4">
              <IconClock className="inline-block mr-1" />
              <p className="text-xl text-center">
                No transactions yet.
              </p>
            </div>
            <Button asChild>
              <Link href={`/companies/${companyId}/transactions`}>
                View all transactions
              </Link>
            </Button>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => labelFromYMD(String(value))}
              />

              <ChartTooltip
                content={({ payload, label }) => {
                  const p0 = payload?.[0]
                  if (!p0) return null
                  return (
                    <div className="rounded-md border bg-background p-2 text-sm shadow-sm font-code">
                      <div className="font-semibold">{labelFromYMD(String(label))}</div>
                      <div>${Number(p0.value).toFixed(2)}</div>
                    </div>
                  )
                }}
              />

              <Area
                dataKey="profit"
                type="natural"
                fill="url(#fillProfit)"
                stroke="var(--primary)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
