// SectionCards.tsx (still server component)
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
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

export default async function SectionCards({ companyId }: { companyId: string }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return notFound()

  // Validate company belongs to current user
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      user: {
        email: session.user.email,
      },
    },
  })

  if (!company) return notFound()

  const income = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: "income", companyId },
  })

  const expense = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { type: "expense", companyId },
  })

  const profit = (income._sum.amount ?? 0) - (expense._sum.amount ?? 0)

  const transactionCount = await prisma.transaction.count({
    where: { companyId },
  })

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {/* Total Earnings */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Earnings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${income._sum.amount?.toFixed(2) ?? "0.00"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp /> +💰
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            All income transactions <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Before expenses and taxes
          </div>
        </CardFooter>
      </Card>

      {/* Total Expenses */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${expense._sum.amount?.toFixed(2) ?? "0.00"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown /> -💸
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            Outgoing payments <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Money spent across accounts
          </div>
        </CardFooter>
      </Card>

      {/* Net Profit */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Net Profit</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${profit.toFixed(2)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {profit >= 0 ? (
                <>
                  <IconTrendingUp /> +Profit
                </>
              ) : (
                <>
                  <IconTrendingDown /> Loss
                </>
              )}
            </Badge>
          </CardAction>
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

      {/* Transaction Count */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>All Transactions</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {transactionCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">📊 Total</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Across this company only</div>
          <div className="text-muted-foreground">Income & expenses included</div>
        </CardFooter>
      </Card>
    </div>
  )
}
