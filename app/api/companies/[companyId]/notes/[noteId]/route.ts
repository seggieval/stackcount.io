// app/api/companies/[companyId]/notes/[noteId]/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const updateSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
}).refine((d) => Object.keys(d).length > 0, { message: "No fields to update" })

async function requireUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
  return user
}

export async function PATCH(req: Request, { params }: { params: { companyId: string; noteId: string } }) {
  try {
    const user = await requireUser()
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    // Ensure note exists AND belongs to this user & company
    const note = await prisma.note.findFirst({
      where: { id: params.noteId, companyId: params.companyId, userId: user.id },
      select: { id: true },
    })
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 })

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const updated = await prisma.note.update({
      where: { id: note.id },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // differentiate messages if you want
      if (err.code === "P2003") {
        return NextResponse.json({ error: "Foreign key constraint" }, { status: 400 })
      }
    }
    console.error("PATCH /notes/:id error:", err)
    return NextResponse.json({ error: "Internal error (PATCH)" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { companyId: string; noteId: string } }) {
  try {
    const user = await requireUser()
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    // Ensure note exists AND belongs to this user & company
    const note = await prisma.note.findFirst({
      where: { id: params.noteId, companyId: params.companyId, userId: user.id },
      select: { id: true },
    })
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 })

    await prisma.note.delete({ where: { id: note.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("DELETE /notes/:id error:", err)
    return NextResponse.json({ error: "Internal error (DELETE)" }, { status: 500 })
  }
}
