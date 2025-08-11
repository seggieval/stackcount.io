// app/api/_debug/route.ts  (or src/app/...)
import { PrismaClient } from '@prisma/client'
export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.count()
    const need = ['DATABASE_URL', 'DIRECT_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'AUTH_URL', 'AUTH_SECRET']
    const envs = Object.fromEntries(need.map(k => [k, process.env[k] ? 'set' : 'MISSING']))
    return new Response(JSON.stringify({ ok: true, envs, users }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 })
  }
}
