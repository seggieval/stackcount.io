// app/api/companies/[companyId]/analyze/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { computeMetrics } from "@/lib/analysis/computeMetrics"
import { enrich } from "@/lib/analysis/enrichMetrics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// ───────────────────────── helpers: tz, cache, AI ─────────────────────────
function isValidTZ(tz?: string | null) {
  if (!tz) return false
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true } catch { return false }
}

const CACHE_TTL_SECONDS = 60 * 10 // 10 min "fresh" window

type CacheRow = {
  key: string
  companyId: string
  payload: unknown
  data: { sections: Array<{ title: string; bullets: string[] }> }
  expiresAt: Date
}

async function getCachedAI(key: string): Promise<(CacheRow & { stale: boolean }) | null> {
  try {
    const row = await prisma.analyzeCache.findUnique({ where: { key } }) as CacheRow | null
    if (!row) return null
    return { ...row, stale: row.expiresAt.getTime() < Date.now() }
  } catch {
    return null
  }
}

async function setCachedAI(
  key: string,
  companyId: string,
  payload: unknown,
  insights: unknown,
  ttl = CACHE_TTL_SECONDS
) {
  try {
    const expiresAt = new Date(Date.now() + ttl * 1000)
    await prisma.analyzeCache.upsert({
      where: { key },
      update: { data: insights as any, expiresAt },
      create: { key, companyId, payload: payload as any, data: insights as any, expiresAt },
    })
  } catch {
    // If AnalyzeCache model doesn't exist yet, just skip caching
  }
}

// Force JSON structure from the model so the UI can render cards reliably
async function aiJSON(payload: any, apiKey?: string) {
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY")
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: [
            "You are an elite small-business finance copilot.",
            "Return ONLY valid JSON matching:",
            "type InsightJSON = { sections: Array<{ title: string; bullets: string[] }> };",
            "No prose outside JSON. Short, punchy bullets. Use only provided numbers.",
            "Preferred section titles: Bottom line, Trend & Volatility, Week-over-Week, Anomalies, Category Mix, Suggestions.",
            "Omit empty sections.",
          ].join(" "),
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  })

  if (!resp.ok) {
    const t = await resp.text()
    throw new Error(`OpenAI HTTP ${resp.status}: ${t}`)
  }

  const json = await resp.json()
  const txt = json?.choices?.[0]?.message?.content
  if (!txt) throw new Error("No content from OpenAI")

  let parsed: { sections?: Array<{ title: string; bullets: string[] }> } = {}
  try { parsed = JSON.parse(txt) } catch { throw new Error("Invalid JSON from OpenAI") }
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("JSON missing sections[]")
  }
  return parsed
}

// ─────────────── helpers: robust income/expense inference & mapping ───────────────
const EXPENSE_SYMS = new Set([
  "expense", "expenses", "debit", "outflow", "withdrawal", "payment", "charge", "purchase",
  "bill", "fee", "subscription", "vendor", "supplier", "payout_out", "transfer_out",
  "card_payment", "cash_withdrawal", "sent", "tax", "utility", "rent", "cost"
])
const INCOME_SYMS = new Set([
  "income", "revenue", "credit", "inflow", "deposit", "sale", "sales", "refund", "interest",
  "payout_in", "transfer_in", "received", "salary", "payroll"
])
const TRANSFER_SYMS = new Set(["transfer", "internal", "move", "balance_transfer"])

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_")

function inferTypeFromRow(row: any): "income" | "expense" | "transfer" {
  const candidates = [
    row.type, row.kind, row.direction, row.flow, row.side, row.entryType,
    row.transactionType, row.txType, row.tx_type, row.categoryType, row.categoryGroup,
    row.category, row.merchant_type, row.subtype, row.status
  ].map(norm).filter(Boolean)

  for (const c of candidates) {
    if (EXPENSE_SYMS.has(c) || [...EXPENSE_SYMS].some(k => c.includes(k))) return "expense"
    if (INCOME_SYMS.has(c) || [...INCOME_SYMS].some(k => c.includes(k))) return "income"
    if (TRANSFER_SYMS.has(c) || [...TRANSFER_SYMS].some(k => c.includes(k))) return "transfer"
  }

  if (row.isExpense === true || row.debit === true) return "expense"
  if (row.isIncome === true || row.credit === true) return "income"

  const signed = Number(row.signedAmount ?? row.amount ?? row.value ?? row.net ?? row.gross ?? 0)
  if (!Number.isNaN(signed)) {
    if (signed < 0) return "expense"
    if (signed > 0) return "income"
  }

  return "expense"
}

function firstNumber(...vals: any[]): number | null {
  for (const v of vals) {
    if (v == null) continue
    const n = Number(v)
    if (!Number.isNaN(n) && Number.isFinite(n)) return n
  }
  return null
}

function extractAmount(row: any): number {
  const cents = firstNumber(row.amountCents, row.minorUnits, row.cents)
  if (cents != null) return Math.abs(cents) / 100
  const n = firstNumber(row.amount, row.value, row.net, row.gross, row.total, row.signedAmount)
  return Math.abs(n ?? 0) // computeMetrics expects POSITIVE numbers
}

const extractCategory = (row: any) =>
  row.category ?? row.categoryName ?? row.category_label ?? null

const extractMerchant = (row: any) =>
  row.merchant ?? row.vendor ?? row.payee ?? row.counterparty ?? row.account ?? null

// Cache key: tie to the *metrics* so we can reuse AI result for the same data
function cacheKey(companyId: string, tz: string, metrics: any) {
  const f = JSON.stringify({
    tz,
    t: metrics.totals,
    w: metrics.wow,
    tr: metrics.trend,
    s: metrics.spikes,
    c: metrics.byCategory.slice(0, 8),
    m: metrics.topMerchants.slice(0, 8),
    r: metrics.recurringCandidates.slice(0, 8),
    td: metrics.topDeltaDays,
  })
  return crypto.createHash("sha256").update(companyId + ":" + f).digest("hex")
}

// ──────────────────────────────── route ────────────────────────────────
export async function POST(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const url = new URL(req.url)
    const tz = isValidTZ(url.searchParams.get("tz")) ? String(url.searchParams.get("tz")) : "UTC"
    const forceRefresh = url.searchParams.get("refresh") === "1" // only re-analyze when requested
    const companyId = params.companyId

    // Load last 90 days without `select` so we see real field names
    const since = new Date()
    since.setDate(since.getDate() - 90)

    const rows = await prisma.transaction.findMany({
      where: { companyId, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
    })

    // Map to Tx[] with robust direction inference. Drop transfers.
    const txs = (rows as any[])
      .map((r) => {
        const type = inferTypeFromRow(r)
        if (type === "transfer") return null
        const amount = extractAmount(r)
        const createdAt = r.createdAt ?? r.date ?? r.postedAt ?? r.timestamp
        return {
          id: String(r.id ?? r.uuid ?? r._id ?? crypto.randomUUID()),
          amount,           // positive
          type,             // "income" | "expense"
          category: extractCategory(r),
          merchant: extractMerchant(r),
          createdAt,
        }
      })
      .filter(Boolean) as any[]

    // If no usable data → skip AI entirely and return a safe fallback
    if (txs.length === 0) {
      return NextResponse.json(
        {
          metrics: {
            rangeDays: 90,
            totals: { income: 0, expense: 0, profit: 0, avgDailyProfit: 0 },
            byDay: [],
            byCategory: [],
            largestTransactions: [],
            topMerchants: [],
          },
          insightsJSON: { sections: [{ title: "Bottom line", bullets: ["No transactions in the last 90 days. Add data to unlock insights."] }] },
          usedAI: false,
          cached: false,
          stale: false,
        },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    // Metrics → Enrich
    const base = computeMetrics(txs as any, tz, 90)
    const metrics = enrich(base)

    // If totals are all zero, still avoid AI
    const noSignal =
      (metrics?.totals?.income ?? 0) === 0 &&
      (metrics?.totals?.expense ?? 0) === 0

    // Build AI payload + cache key
    const payload = {
      tz,
      rangeDays: metrics.rangeDays,
      totals: metrics.totals,
      wow: metrics.wow,
      trend: metrics.trend,
      spikes: metrics.spikes,
      byCategory: metrics.byCategory.slice(0, 8),
      recurringCandidates: metrics.recurringCandidates.slice(0, 8),
      topMerchants: metrics.topMerchants.slice(0, 8),
      topDeltaDays: metrics.topDeltaDays,
    }
    const key = cacheKey(companyId, tz, metrics)

    // 1) If we have cache and NOT refreshing, return cache (do not call AI)
    const cached = await getCachedAI(key)
    if (!forceRefresh && cached?.data) {
      return NextResponse.json(
        {
          metrics,
          insightsJSON: cached.data,
          usedAI: false,
          cached: true,
          stale: cached.stale,
        },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    // 2) If we have no meaningful data signal, avoid AI even on refresh
    if (noSignal) {
      return NextResponse.json(
        {
          metrics,
          insightsJSON: { sections: [{ title: "Bottom line", bullets: ["No meaningful activity detected for this period."] }] },
          usedAI: false,
          cached: false,
          stale: false,
        },
        { headers: { "Cache-Control": "no-store" } }
      )
    }

    // 3) We are refreshing → call AI, cache, and return.
    let insightsJSON: { sections: Array<{ title: string; bullets: string[] }> } | null = null
    try {
      insightsJSON = await aiJSON(payload, process.env.OPENAI_API_KEY)
      await setCachedAI(key, companyId, payload, insightsJSON) // fresh cache
      return NextResponse.json(
        { metrics, insightsJSON, usedAI: true, cached: false, stale: false },
        { headers: { "Cache-Control": "no-store" } }
      )
    } catch (e) {
      console.error("[analyze] AI error:", e)
      // 4) If AI fails, fall back to whatever cache we had (even stale)
      if (cached?.data) {
        return NextResponse.json(
          { metrics, insightsJSON: cached.data, usedAI: false, cached: true, stale: true },
          { headers: { "Cache-Control": "no-store" } }
        )
      }
      return NextResponse.json(
        { error: "AI unavailable and no cached insights yet." },
        { status: 503 }
      )
    }
  } catch (e: any) {
    console.error("[analyze] 500:", e?.message ?? e)
    return NextResponse.json({ error: "Internal error in /analyze" }, { status: 500 })
  }
}
