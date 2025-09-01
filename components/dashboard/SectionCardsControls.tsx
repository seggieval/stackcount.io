// components/dashboard/SectionCardsControls.tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Period } from "./SectionCards"
import QuickAddTransactionFAB from "./QuickAddTransactionFAB"

export default function SectionCardsControls({ period }: { period: Period }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setPeriod(next: Period) {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("period", next)
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <QuickAddTransactionFAB />
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={(v) => v && setPeriod(v as Period)}
        className="flex flex-wrap gap-0"
      >
        {[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
          { value: "quarter", label: "Quarter" },
          { value: "year", label: "Year" },
          { value: "all", label: "All" },
        ].map(({ value, label }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            variant={period === value ? "primary" : "outline"}
            className="px-5"
          >
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
