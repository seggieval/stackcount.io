export const runtime = 'nodejs';

import { prisma } from "@/lib/prisma"
import { requireCompanyAccess } from "@/lib/require-company-access"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params

  const access = await requireCompanyAccess(companyId)
  if ("error" in access) {
    return new NextResponse(access.error, { status: access.status })
  }

  const transactions = await prisma.transaction.findMany({
    where: { companyId },
    orderBy: { date: "asc" },
  })

  const profitMap: Record<string, number> = {}

  for (const tx of transactions) {
    const dateKey = tx.date.toISOString().split("T")[0] // e.g. "2024-08-01"
    const amount = tx.type === "income" ? tx.amount : -tx.amount
    profitMap[dateKey] = (profitMap[dateKey] || 0) + amount
  }

  const result = Object.entries(profitMap).map(([date, profit]) => ({
    date,
    profit: Number(profit.toFixed(2)),
  }))

  return NextResponse.json(result)
}
