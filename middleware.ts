import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

const hasUpstash = !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
const redis = hasUpstash ? Redis.fromEnv() : undefined
const limiter = hasUpstash
  ? new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(40, "60 s"), // tweak limits as you like
    analytics: true,
    prefix: "rl:auth",
  })
  : null

function ipFor(req: NextRequest) {
  return (
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  )
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // redirect signed-in users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (token) {
      const url = req.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  // rate limit next-auth endpoints
  if (pathname.startsWith("/api/auth/")) {
    if (!limiter) return NextResponse.next() // no Upstash configured
    const { success, limit, remaining, reset } = await limiter.limit(`ip:${ipFor(req)}`)
    if (!success) {
      const res = NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      )
      res.headers.set("Retry-After", String(Math.ceil((reset - Date.now()) / 1000)))
      res.headers.set("X-RateLimit-Limit", String(limit))
      res.headers.set("X-RateLimit-Remaining", String(remaining))
      res.headers.set("X-RateLimit-Reset", String(reset))
      return res
    }
    const res = NextResponse.next()
    res.headers.set("X-RateLimit-Limit", String(limit))
    res.headers.set("X-RateLimit-Remaining", String(remaining))
    res.headers.set("X-RateLimit-Reset", String(reset))
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/auth/:path*", "/login", "/register", "/dashboard/:path*", "/settings/:path*"],
}
