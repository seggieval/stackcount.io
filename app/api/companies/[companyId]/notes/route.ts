// app/api/companies/[companyId]/notes/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const createSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(1, "content required"),
})

export async function GET(_req: Request, { params }: { params: { companyId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 })

    const notes = await prisma.note.findMany({
      where: { companyId: params.companyId, userId: user.id, archived: false },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    })
    return NextResponse.json(notes)
  } catch (err) {
    console.error("GET /notes error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 })

    // ensure company belongs to this user
    const company = await prisma.company.findFirst({
      where: { id: params.companyId, userId: user.id },
      select: { id: true },
    })
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 })

    const json = await req.json().catch(() => null)
    if (!json) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

    const parsed = createSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const note = await prisma.note.create({
      data: {
        companyId: company.id,
        userId: user.id,
        title: parsed.data.title ?? "",
        content: parsed.data.content,
      },
    })
    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") return NextResponse.json({ error: "Invalid foreign key" }, { status: 400 })
    }
    console.error("POST /notes error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
