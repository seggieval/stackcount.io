import SectionCards from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"

import { TableComponent } from "@/components/TableComponent"

type Props = {
  params: {
    companyId: string
  }
}

export default function CompanyDashboard({ params }: Props) {
  const companyId = params.companyId

  return (
    <div className="flex flex-1 flex-col p-2 md:p-6">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards companyId={companyId} />
          <div className="flex gap-4 flex-col xl:flex-row">
            <ChartAreaInteractive className="w-full" />
            <TableComponent companyId={companyId} />
          </div>
        </div>
      </div>
    </div>
  )
}
