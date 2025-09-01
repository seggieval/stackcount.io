export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
}

export async function GET(_req: Request, { params }: { params: { companyId: string } }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const notes = await prisma.note.findMany({
    where: { companyId: params.companyId, userId: user.id },
    orderBy: { updatedAt: "desc" },
  })

  // IMPORTANT: return the array directly
  return NextResponse.json(notes)
}

export async function POST(req: Request, { params }: { params: { companyId: string } }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

  const body = await req.json()
  const note = await prisma.note.create({
    data: {
      companyId: params.companyId,
      userId: user.id,
      title: (body.title ?? "").slice(0, 160),
      content: String(body.content ?? ""),
      // completed defaults to false in Prisma
    },
  })
  return NextResponse.json(note, { status: 201 })
}
