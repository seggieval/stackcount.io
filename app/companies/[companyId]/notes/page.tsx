"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { toast } from "sonner"
import {
  IconPlus,
  IconNotes,
  IconTrash,
  IconCircle,
  IconCircleCheck,
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

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const MAX_LEN = 10_000

export default function NotesPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const { data, mutate, isLoading } = useSWR<Note[]>(
    companyId ? `/api/companies/${companyId}/notes` : null,
    fetcher
  )

  const activeNotes = useMemo(
    () =>
      (data ?? [])
        .filter((n) => !n.completed)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [data]
  )
  const completedNotes = useMemo(
    () =>
      (data ?? [])
        .filter((n) => n.completed)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [data]
  )

  // dialog state
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter" && open && !submitting) {
        e.preventDefault()
        void addNote()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, submitting, title, content])

  async function addNote() {
    const trimmed = content.trim()
    if (!trimmed) return
    if (trimmed.length > MAX_LEN) {
      toast.error(`Note is too long (>${MAX_LEN} chars)`)
      return
    }

    setSubmitting(true)
    const payload = { title: title.trim(), content: trimmed }

    // optimistic create
    const optimistic: Note = {
      id: `tmp-${Date.now()}`,
      title: payload.title ?? "",
      content: payload.content,
      completed: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mutate([optimistic, ...(data ?? [])], false)

    try {
      const res = await fetch(`/api/companies/${companyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("create failed")
      await mutate()
      toast.success("Note saved")
      setTitle("")
      setContent("")
      setOpen(false)
    } catch {
      toast.error("Failed to save note")
      await mutate()
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleComplete(n: Note) {
    const updated = { ...n, completed: !n.completed, updatedAt: new Date().toISOString() }
    mutate((prev) => {
      const list = prev ?? []
      return list.map((x) => (x.id === n.id ? updated : x))
    }, false)

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

  async function remove(n: Note) {
    mutate((prev) => (prev ?? []).filter((x) => x.id !== n.id), false)
    try {
      await fetch(`/api/companies/${companyId}/notes/${n.id}`, { method: "DELETE" })
      await mutate()
      toast.success("Deleted")
    } catch {
      toast.error("Delete failed")
      await mutate()
    }
  }

  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Header / New note */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-title font-semibold flex items-center gap-2">
          <IconNotes className="size-5" />
          Notes
        </h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <IconPlus className="size-4" />
              New note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create note</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional title"
                maxLength={160}
              />
              <div className="space-y-2">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note…"
                  className="min-h-[160px]"
                  maxLength={MAX_LEN}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tip: ⌘/Ctrl + Enter to save</span>
                  <span>{content.length}/{MAX_LEN}</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={addNote} disabled={submitting || !content.trim()} className="gap-1">
                <IconPlus className="size-4" />
                {submitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main grid: Active (2/3) + Completed (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active */}
        <Card className="p-4 md:p-6 md:col-span-2 gap-4">
          <h3 className="text-lg font-semibold mb-4">Active</h3>
          <Separator className="mb-4" />

          {!isLoading && activeNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
              <IconNotes className="size-10 mb-3" />
              <p className="text-base font-medium">No active notes</p>
              <p className="text-sm">Create a note and keep building.</p>
            </div>
          )}

          {isLoading && (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="border rounded-lg p-3">
                  <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-2/3 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </li>
              ))}
            </ul>
          )}

          {!isLoading && activeNotes.length > 0 && (
            <ul className="space-y-3">
              {activeNotes.map((n) => (
                <li key={n.id} className="border rounded-lg p-3 hover:bg-accent/30 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {n.title ? (
                        <p className="font-medium truncate">{n.title}</p>
                      ) : (
                        <p className="font-medium text-muted-foreground">Untitled</p>
                      )}
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                        {n.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(n.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleComplete(n)}
                        title="Mark complete"
                        aria-label="Mark complete"
                      >
                        <IconCircle className="size-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(n)}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <IconTrash className="size-5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Completed */}
        <Card className="p-4 md:p-6 h-full gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Completed</h3>
            <span className="text-xs text-muted-foreground">
              {completedNotes.length}
            </span>
          </div>
          <Separator className="mb-4" />

          {completedNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing completed yet.</p>
          ) : (
            <ul className="space-y-3">
              {completedNotes.map((n) => (
                <li key={n.id} className="border rounded-lg p-3 bg-accent/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium line-through truncate">
                        {n.title || "Untitled"}
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-through mt-1">
                        {n.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed • {new Date(n.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleComplete(n)}
                        title="Mark active"
                        aria-label="Mark active"
                      >
                        <IconCircleCheck className="size-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(n)}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <IconTrash className="size-5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Mobile FAB */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="sm:hidden fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 shadow-lg"
            aria-label="New note"
          >
            <IconPlus className="size-5" />
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  )
}
