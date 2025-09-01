// lib/analysis/computeMetrics.ts

export type Tx = {
  id: string
  amount: number          // POSITIVE number, sign is implied by `type`
  type: "income" | "expense"
  category?: string | null
  merchant?: string | null
  createdAt: string | Date
}

export type ComputedMetrics = {
  rangeDays: number
  startDate: string
  endDate: string
  totals: {
    income: number
    expense: number
    profit: number
    avgDailyProfit: number
  }
  byDay: Array<{ date: string; profit: number }>
  byCategory: Array<{ category: string; income: number; expense: number; profit: number }>
  largestTransactions: Array<{
    id: string
    date: string
    amount: number
    type: "income" | "expense"
    category?: string | null
    merchant?: string | null
  }>

  /**
   * Top merchants summary.
   * - income: sum of income amounts attributed to merchant (positive)
   * - expense: sum of expense amounts attributed to merchant (positive)
   * - total: alias for "spend" to preserve backward-compat with any consumer expecting a single number (== expense)
   * - net: income - expense
   */
  topMerchants: Array<{ merchant: string; count: number; income: number; expense: number; total: number; net: number }>

  /**
   * Recurring candidates grouped by (merchant + signed amount).
   * The key encodes sign so income/expense do not collapse together.
   */
  recurringCandidates: Array<{ key: string; count: number; total: number; avg: number }>
  spikes: Array<{ date: string; profit: number }>
}

const pad = (n: number) => String(n).padStart(2, "0")
const toLocalYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// date → YYYY-MM-DD in given IANA tz (works on Node with Intl)
export function ymdInTZ(input: string | Date, tz: string) {
  const dt = new Date(input)
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dt)
  const y = parts.find((p) => p.type === "year")?.value ?? "1970"
  const m = parts.find((p) => p.type === "month")?.value ?? "01"
  const d = parts.find((p) => p.type === "day")?.value ?? "01"
  return `${y}-${m}-${d}`
}

export function computeMetrics(txs: Tx[], tz: string, rangeDays = 90): ComputedMetrics {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - rangeDays + 1)

  const endStr = toLocalYMD(end)
  const startStr = toLocalYMD(start)

  // bucket by local day
  const dayMap = new Map<string, number>()
  let income = 0,
    expense = 0

  const byCatMap = new Map<string, { income: number; expense: number }>()
  // Track merchant income & expense separately so they don't collapse into "income only"
  const merchantMap = new Map<string, { count: number; income: number; expense: number }>()
  const largest: ComputedMetrics["largestTransactions"] = []

  for (const t of txs) {
    const day = ymdInTZ(t.createdAt, tz)
    // filter range
    if (day < startStr || day > endStr) continue

    // signed delta for profit-by-day
    const delta = t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount)
    dayMap.set(day, (dayMap.get(day) ?? 0) + delta)

    // totals
    if (t.type === "expense") expense += Math.abs(t.amount)
    else income += Math.abs(t.amount)

    // by-category
    const cat = t.category ?? "Uncategorized"
    const c = byCatMap.get(cat) ?? { income: 0, expense: 0 }
    if (t.type === "expense") c.expense += Math.abs(t.amount)
    else c.income += Math.abs(t.amount)
    byCatMap.set(cat, c)

    // by-merchant (separate income vs expense)
    if (t.merchant) {
      const m = merchantMap.get(t.merchant) ?? { count: 0, income: 0, expense: 0 }
      m.count += 1
      if (t.type === "expense") {
        m.expense += Math.abs(t.amount) // store spend as positive
      } else {
        m.income += Math.abs(t.amount)  // store revenue as positive
      }
      merchantMap.set(t.merchant, m)
    }

    // largest list is for UI only; keep amount positive for display
    largest.push({
      id: t.id,
      date: day,
      amount: Math.abs(t.amount),
      type: t.type,
      category: t.category,
      merchant: t.merchant,
    })
  }

  // fill missing days with 0
  const byDay: ComputedMetrics["byDay"] = []
  {
    const cursor = new Date(start)
    while (toLocalYMD(cursor) <= endStr) {
      const d = toLocalYMD(cursor)
      byDay.push({ date: d, profit: Number((dayMap.get(d) ?? 0).toFixed(2)) })
      cursor.setDate(cursor.getDate() + 1)
    }
  }

  const profit = income - expense
  const avgDailyProfit =
    byDay.length ? byDay.reduce((a, b) => a + b.profit, 0) / byDay.length : 0

  const byCategory = [...byCatMap.entries()]
    .map(([category, v]) => ({
      category,
      income: Number(v.income.toFixed(2)),
      expense: Number(v.expense.toFixed(2)),
      profit: Number((v.income - v.expense).toFixed(2)),
    }))
    .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))

  // Build top merchants with separate income/expense and net.
  // Keep "total" as spend (== expense) for backward-compat with any consumer expecting a single number.
  const topMerchants = [...merchantMap.entries()]
    .map(([merchant, v]) => {
      const income = Number((v.income ?? 0).toFixed(2))
      const expense = Number((v.expense ?? 0).toFixed(2))
      const net = Number((income - expense).toFixed(2))
      const total = expense // spend
      return { merchant, count: v.count, income, expense, total, net }
    })
    // Sort by highest spend by default; change to Math.abs(net) if you prefer "impact"
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const largestTransactions = largest
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  // --- Recurring heuristic ---
  // Use signed amount in the key so income vs expense don't merge.
  const recurMap = new Map<string, { count: number; total: number }>()
  for (const t of txs) {
    const signed = t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount)
    const key = `${t.merchant ?? "?"}::${signed.toFixed(2)}`
    const cur = recurMap.get(key) ?? { count: 0, total: 0 }
    cur.count += 1
    cur.total += signed
    recurMap.set(key, cur)
  }
  const recurringCandidates = [...recurMap.entries()]
    .map(([key, v]) => ({
      key,
      count: v.count,
      total: Number(v.total.toFixed(2)),
      avg: Number((v.total / v.count).toFixed(2)),
    }))
    .filter((x) => x.count >= 3)
    // highest absolute spend/revenue first
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    .slice(0, 10)

  // spikes: top 5 absolute-profit days
  const spikes = [...byDay]
    .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))
    .slice(0, 5)

  return {
    rangeDays,
    startDate: startStr,
    endDate: endStr,
    totals: {
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      avgDailyProfit: Number(avgDailyProfit.toFixed(2)),
    },
    byDay,
    byCategory,
    largestTransactions,
    topMerchants,
    recurringCandidates,
    spikes,
  }
}
