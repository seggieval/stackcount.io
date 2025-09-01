// app/companies/[companyId]/dashboard/page.tsx
import SectionCards, { type Period } from "@/components/dashboard/SectionCards"
import SectionCardsControls from "@/components/dashboard/SectionCardsControls"
import { Suspense } from "react"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import { TableComponent } from "@/components/dashboard/TableComponent"
import LatestNotes from "@/components/dashboard/LatestNotes"
import RefreshOnTransactionChange from "@/components/dashboard/RefreshOnTransactionChange";
import AnalyzeWidget from "@/components/analyze/AnalyzeWidget"


function coercePeriod(p?: string | string[]): Period {
  const allowed: Period[] = ["day", "week", "month", "quarter", "year", "all"]
  const v = Array.isArray(p) ? p[0] : p
  return allowed.includes(v as Period) ? (v as Period) : "month"
}

export default function CompanyDashboard({
  params,
  searchParams,
}: {
  params: { companyId: string }
  searchParams?: { period?: string | string[] }
}) {
  const companyId = params.companyId
  const period = coercePeriod(searchParams?.period)

  return (
    <div className="flex flex-1 flex-col p-2 md:p-6">
      <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Client controls only update ?period=... */}
          <div className="space-y-2">
            
            <SectionCardsControls period={period} />

            {/* Server cards render for the selected period */}
            <Suspense
              key={period}
              fallback={<div className="h-28 rounded-xl border animate-pulse" />}
            >
              <SectionCards companyId={companyId} period={period} />
            </Suspense>
          </div>
          <RefreshOnTransactionChange>
            <div className="flex gap-4 flex-col xl:flex-row">
              <ChartAreaInteractive className="w-full" />
              <TableComponent companyId={companyId} />
            </div>
          </RefreshOnTransactionChange>
        </div>

        <div className="flex gap-4 flex-col xl:flex-row">
          <LatestNotes
            companyId={companyId}
            limit={5}
            includeCompleted={false}
            className="p-4 md:p-6 gap-4 w-full h-fit"
          />
          <AnalyzeWidget className="p-4 md:p-6 gap-4 w-full h-fit" />
        </div>
      </div>
    </div>
  )
}
