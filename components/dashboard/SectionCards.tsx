// Server component
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type Period = "day" | "week" | "month" | "quarter" | "year" | "all"

function startOfUTC(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m, d))
}
function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}
function addMonths(date: Date, months: number) {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth()
  return new Date(Date.UTC(y, m + months, 1))
}

function getRange(period: Period, now = new Date()) {
  if (period === "all") return { start: null as Date | null, end: null as Date | null, label: "All Time" }

  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const d = now.getUTCDate()

  let start: Date
  let end: Date
  let label = ""

  switch (period) {
    case "day": {
      start = startOfUTC(y, m, d)
      end = addDays(start, 1)
      label = "Today"
      break
    }
    case "week": {
      // week starts on Sunday (UTC)
      const dow = now.getUTCDay() // 0=Sun
      start = startOfUTC(y, m, d - dow)
      end = addDays(start, 7)
      label = "This Week"
      break
    }
    case "month": {
      start = new Date(Date.UTC(y, m, 1))
      end = addMonths(start, 1)
      label = "This Month"
      break
    }
    case "quarter": {
      const qStartMonth = Math.floor(m / 3) * 3
      start = new Date(Date.UTC(y, qStartMonth, 1))
      end = addMonths(start, 3)
      label = "This Quarter"
      break
    }
    case "year": {
      start = new Date(Date.UTC(y, 0, 1))
      end = new Date(Date.UTC(y + 1, 0, 1))
      label = "This Year"
      break
    }
    default:
      start = new Date(0)
      end = now
      label = "All Time"
  }

  return { start, end, label }
}

function getPreviousRange(start: Date, end: Date) {
  const span = end.getTime() - start.getTime()
  const prevEnd = start
  const prevStart = new Date(start.getTime() - span)
  return { prevStart, prevEnd }
}

function pctChange(current: number, prev: number) {
  if (prev === 0) return null
  return ((current - prev) / Math.abs(prev)) * 100
}

function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })
}

export default async function SectionCards({
  companyId,
  period = "month",
}: {
  companyId: string
  period?: Period
}) {
  noStore()

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return notFound()

  const company = await prisma.company.findFirst({
    where: { id: companyId, user: { email: session.user.email } },
    select: { id: true },
  })
  if (!company) return notFound()

  const { start, end, label } = getRange(period)
  const dateWhere = start && end ? { createdAt: { gte: start, lt: end } } : {}
  const whereBase = { companyId }

  // current window
  const [incomeAgg, expenseAgg, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...whereBase, type: "income", ...dateWhere },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...whereBase, type: "expense", ...dateWhere },
    }),
    prisma.transaction.count({ where: { ...whereBase, ...dateWhere } }),
  ])

  const income = Number(incomeAgg._sum.amount ?? 0)
  const expense = Number(expenseAgg._sum.amount ?? 0)
  const profit = income - expense

  // previous window (if not 'all')
  let prevIncome = 0
  let prevExpense = 0
  let prevProfit = 0
  if (start && end) {
    const { prevStart, prevEnd } = getPreviousRange(start, end)
    const prevDateWhere = { createdAt: { gte: prevStart, lt: prevEnd } }

    const [pIncomeAgg, pExpenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...whereBase, type: "income", ...prevDateWhere },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { ...whereBase, type: "expense", ...prevDateWhere },
      }),
    ])

    prevIncome = Number(pIncomeAgg._sum.amount ?? 0)
    prevExpense = Number(pExpenseAgg._sum.amount ?? 0)
    prevProfit = prevIncome - prevExpense
  }

  const incomePct = pctChange(income, prevIncome)
  const expensePct = pctChange(expense, prevExpense)
  const profitPct = pctChange(profit, prevProfit)

  const TrendBadge = ({
    value,
    positiveMeansUp = true,
    label,
  }: {
    value: number | null
    positiveMeansUp?: boolean
    label: string
  }) => {
    if (value === null) {
      return (
        <Badge variant="outline">
          {label}: —{/* no previous period */}
        </Badge>
      )
    }
    const up = value >= 0
    const isPositive = up === positiveMeansUp
    return (
      <Badge variant="outline" className={isPositive ? "text-emerald-600" : "text-rose-600"}>
        {up ? <IconTrendingUp className="mr-1 size-4" /> : <IconTrendingDown className="mr-1 size-4" />}
        {label}: {value.toFixed(1)}%
      </Badge>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Income */}
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmtMoney(income)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            All income in selected period <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Before expenses & taxes</div>
        </CardFooter>
      </Card>

      {/* Expenses */}
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmtMoney(expense)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Outgoing in selected period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Money spent</div>
        </CardFooter>
      </Card>

      {/* Profit */}
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Net Profit</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {fmtMoney(profit)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {profit >= 0 ? "Earning more than spending" : "Spending exceeds income"}
            {profit >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Income – Expenses</div>
        </CardFooter>
      </Card>

      {/* Count */}
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Transactions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {transactionCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">This company only</div>
          <div className="text-muted-foreground">Income & expenses included</div>
        </CardFooter>
      </Card>
    </div>
  )
}
