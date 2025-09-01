import AnalyzePanel from "@/components/analyze/AnalyzePanel"
import RefreshOnTransactionChange from "@/components/dashboard/RefreshOnTransactionChange"

export default function AnalyzePage({ params }: { params: { companyId: string } }) {
  return (
    <div className="space-y-6 m-2 md:m-6">

      <RefreshOnTransactionChange>
        <AnalyzePanel />
      </RefreshOnTransactionChange>
    </div>
  )
}
