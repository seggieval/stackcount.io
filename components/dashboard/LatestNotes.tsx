"use client"

import { useMemo } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  IconNotes,
  IconCircle,
  IconCircleCheck,
  IconChevronRight,
} from "@tabler/icons-react"

type Note = {
  id: string
  title: string
  content: string
  completed: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return Array.isArray(json) ? json : json?.notes ?? []
}

// tiny relative-time helper
function timeAgo(iso: string) {
  const d = new Date(iso).getTime()
  const diff = Date.now() - d
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

type Props = {
  companyId?: string // optional; will read from route if not provided
  limit?: number
  includeCompleted?: boolean
  className?: string
}

export default function LatestNotes({
  companyId: companyIdProp,
  limit = 5,
  includeCompleted = false,
  className,
}: Props) {
  const routeParams = useParams<{ companyId: string }>()
  const companyId = companyIdProp ?? routeParams?.companyId

  const { data, error, isLoading, mutate } = useSWR<Note[]>(
    companyId ? `/api/companies/${companyId}/notes` : null,
    fetcher
  )

  const latest = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    const filtered = list
      .filter((n) => !n.archived)
      .filter((n) => (includeCompleted ? true : !n.completed))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, limit)
    return filtered
  }, [data, limit, includeCompleted])

  async function toggleComplete(n: Note) {
    const updated = { ...n, completed: !n.completed, updatedAt: new Date().toISOString() }
    // optimistic update across the full dataset
    mutate(
      (prev) => (prev ?? []).map((x) => (x.id === n.id ? updated : x)),
      false
    )
    try {
      await fetch(`/api/companies/${companyId}/notes/${n.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updated.completed }),
      })
      await mutate()
    } catch {
      toast.error("Failed to update")
      await mutate()
    }
  }

  return (
    <Card className={className ?? "p-4 md:p-6 gap-4"}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <IconNotes className="size-5" />
          Latest Notes
        </h3>
        {companyId && (
          <Button asChild variant="ghost" size="sm" className="gap-1">
            <Link href={`/companies/${companyId}/notes`}>
              View all
              <IconChevronRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
      <Separator className="mb-3" />

      {/* states */}
      {error && (
        <p className="text-sm text-destructive">Couldn’t load notes.</p>
      )}

      {isLoading && (
        <ul className="space-y-3">
          {Array.from({ length: Math.min(3, limit) }).map((_, i) => (
            <li key={i} className="border rounded-lg p-3">
              <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-2/3 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            </li>
          ))}
        </ul>
      )}

      {!isLoading && latest.length === 0 && (
        <p className="text-sm text-muted-foreground">No recent notes.</p>
      )}

      {!isLoading && latest.length > 0 && (
        <ul className="space-y-2">
          {latest.map((n) => (
            <li
              key={n.id}
              className="border rounded-lg p-3 hover:bg-accent/30 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {n.title || "Untitled"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 whitespace-pre-wrap">
                    {n.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {timeAgo(n.updatedAt)}
                    {n.completed && <span className="ml-2">• Completed</span>}
                  </p>
                </div>
                <div className="shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleComplete(n)}
                    title={n.completed ? "Mark active" : "Mark complete"}
                    aria-label={n.completed ? "Mark active" : "Mark complete"}
                  >
                    {n.completed ? (
                      <IconCircleCheck className="size-5" />
                    ) : (
                      <IconCircle className="size-5" />
                    )}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
