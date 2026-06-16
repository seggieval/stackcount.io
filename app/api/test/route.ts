// app/api/test/route.ts
import { PrismaClient } from "@prisma/client"

export const runtime = "nodejs"

const prisma = new PrismaClient()

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not Found", { status: 404 })
  }

  try {
    const users = await prisma.user.count()
    const need = [
      "DATABASE_URL",
      "NEXTAUTH_URL",
      "NEXTAUTH_SECRET",
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
    ]
    const envs = Object.fromEntries(
      need.map((k) => [k, process.env[k] ? "set" : "MISSING"])
    )
    return new Response(JSON.stringify({ ok: true, envs, users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e: unknown) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500 }
    )
  }
}
