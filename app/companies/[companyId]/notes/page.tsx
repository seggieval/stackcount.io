"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  IconBookmark,
  IconBookmarkFilled,
  IconPlus,
  IconNotes,
  IconTrash,
} from "@tabler/icons-react"

type Note = {
  id: string
  title: string
  content: string
  pinned: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function NotesPage() {
  const { companyId } = useParams<{ companyId: string }>()
  const { data: notes, mutate, isLoading } = useSWR<Note[]>(
    companyId ? `/api/companies/${companyId}/notes` : null,
    fetcher
  )

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  async function addNote() {
    if (!content.trim()) return
    const payload = { title: title.trim(), content: content.trim() }
    setTitle("")
    setContent("")
    // optimistic
    const optimistic: Note = {
      id: `tmp-${Date.now()}`,
      title: payload.title ?? "",
      content: payload.content,
      pinned: false,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mutate([optimistic, ...(notes ?? [])], false)
    try {
      const res = await fetch(`/api/companies/${companyId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("create failed")
      await mutate()
      toast.success("Note saved")
    } catch {
      toast.error("Failed to save note")
      await mutate()
    }
  }

  async function togglePin(n: Note) {
    const updated = { ...n, pinned: !n.pinned }
    mutate(
      (notes ?? []).map((x) => (x.id === n.id ? updated : x)),
      false
    )
    try {
      await fetch(`/api/companies/${companyId}/notes/${n.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: updated.pinned }),
      })
      await mutate()
    } catch {
      toast.error("Failed to update")
      await mutate()
    }
  }

  async function remove(n: Note) {
    const prev = notes ?? []
    mutate(prev.filter((x) => x.id !== n.id), false)
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
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <Card className="p-4 md:p-6 space-y-4">
        <h2 className="text-xl font-title font-semibold flex items-center gap-2">
          <IconNotes className="size-5" />
          Notes
        </h2>
        <div className="grid gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note…"
            className="min-h-[120px]"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {content.length}/10,000
          </span>
          <Button onClick={addNote} className="gap-1">
            <IconPlus className="size-4" />
            Save
          </Button>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">Your notes</h3>
        <Separator className="mb-4" />

        {/* Empty state */}
        {!isLoading && (!notes || notes.length === 0) && (
          <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
            <IconNotes className="size-10 mb-3" />
            <p className="text-base font-medium">No notes yet</p>
            <p className="text-sm">
              Start by writing something above and hit <span className="font-medium">Save</span>.
            </p>
          </div>
        )}

        {/* List */}
        <ul className="space-y-3">
          {notes?.map((n) => (
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
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => togglePin(n)}
                    title={n.pinned ? "Unpin" : "Pin"}
                  >
                    {n.pinned ? (
                      <IconBookmarkFilled className="size-5" />
                    ) : (
                      <IconBookmark className="size-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(n)}
                    title="Delete"
                  >
                    <IconTrash className="size-5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
