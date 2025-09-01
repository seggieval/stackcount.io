import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export const DAILY_LIMIT = 50
export const PER_MIN_LIMIT = 5
export const COOLDOWN_SECONDS = 10
export const CACHE_TTL_SECONDS = 600 // 10min

export function todayYMD(d = new Date()) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function cacheKeyFor(companyId: string, tz: string, metricsFingerprint: string) {
  return crypto.createHash("sha256").update(JSON.stringify({ companyId, tz, f: metricsFingerprint })).digest("hex")
}

export async function getAndBumpUsage(companyId: string, userId?: string) {
  const date = todayYMD()
  const usage = await prisma.analyzeUsage.upsert({
    where: { companyId_userId_date: { companyId, userId: userId ?? "anon", date } },
    update: {},
    create: { companyId, userId: userId ?? "anon", date, count: 0 },
  })
  return usage
}

export async function incrementUsage(companyId: string, userId?: string) {
  const date = todayYMD()
  return prisma.analyzeUsage.update({
    where: { companyId_userId_date: { companyId, userId: userId ?? "anon", date } },
    data: { count: { increment: 1 } },
  })
}

export function tooSoon(lastAt: Date) {
  const diffSec = (Date.now() - lastAt.getTime()) / 1000
  return diffSec < COOLDOWN_SECONDS
}

export async function findCache(key: string) {
  return prisma.analyzeCache.findUnique({ where: { key } })
}

export async function setCache(key: string, companyId: string, payload: unknown, data: unknown, ttl = CACHE_TTL_SECONDS) {
  const expiresAt = new Date(Date.now() + ttl * 1000)
  await prisma.analyzeCache.upsert({
    where: { key },
    update: { data: data as any, expiresAt },
    create: { key, companyId, payload: payload as any, data: data as any, expiresAt },
  })
}
