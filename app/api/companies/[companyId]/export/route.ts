import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // adjust if your prisma path differs

// escape for CSV: wrap in quotes and double any quotes inside
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ""
  const s = String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCSV(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const header = columns.join(",")
  const body = rows
    .map((r) => columns.map((c) => csvEscape(r[c])).join(","))
    .join("\n")
  return `${header}\n${body}\n`
}

// GET /api/companies/:companyId/export?format=csv&start=YYYY-MM-DD&end=YYYY-MM-DD&tz=America/New_York
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get("format") ?? "csv"
  if (format !== "csv") return NextResponse.json({ error: "Unsupported format" }, { status: 400 })

  const start = searchParams.get("start") // inclusive
  const end = searchParams.get("end")     // inclusive (we’ll push to 23:59:59)
  const tz = searchParams.get("tz") ?? "UTC"

  // basic auth/ownership check here if you have user in session
  // const session = await auth(); ensure company belongs to user, etc.

  const where: any = { companyId: params.companyId }
  if (start || end) {
    // make Date objects in local TZ then convert; simplest: treat as midnight local and end-of-day local
    const toLocalDate = (d: string, endOfDay = false) => {
      const [y, m, day] = d.split("-").map(Number)
      const date = new Date(Date.UTC(y, m - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0))
      return date
    }
    where.createdAt = {}
    if (start) where.createdAt.gte = toLocalDate(start, false)
    if (end) where.createdAt.lte = toLocalDate(end, true)
  }

  // pull transactions; adjust fields to your Tx model
  const txs = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      createdAt: true,
    },
  })

  const rows = txs.map((t) => ({
    id: t.id,
    date: t.createdAt.toISOString().slice(0, 10),
    createdAt: t.createdAt.toISOString(),
    amount: t.amount,
    type: t.type,
    category: t.category ?? "",
  }))

  const columns = ["id", "date", "createdAt", "amount", "type", "category"]
  const csv = toCSV(rows, columns)
  const filename = `transactions_${params.companyId}${start ? "_" + start : ""}${end ? "_" + end : ""}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
