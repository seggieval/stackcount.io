"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Download } from "lucide-react"

type Props = {
  companyId: string
  trigger?: React.ReactNode // optional custom trigger
}

export default function ExportCSVDialog({ companyId, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const [start, setStart] = useState<string>("")
  const [end, setEnd] = useState<string>(today)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  async function handleExport() {
    try {
      setLoading(true)
      setError("")
      const params = new URLSearchParams({ format: "csv", tz: Intl.DateTimeFormat().resolvedOptions().timeZone })
      if (start) params.set("start", start)
      if (end) params.set("end", end)

      // fetch with cookies, download blob
      const res = await fetch(`/api/companies/${companyId}/export?` + params.toString(), {
        method: "GET",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Export failed (${res.status})`)

      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") || ""
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? `transactions_${companyId}.csv`

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setOpen(false)
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full justify-start gap-2 mt-auto">
            <Download className="size-4" />
            Quick Export CSV
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export transactions (CSV)</DialogTitle>
          <DialogDescription>
            Choose a date range. Leave start empty to export from the beginning.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? "Preparing…" : "Export CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
