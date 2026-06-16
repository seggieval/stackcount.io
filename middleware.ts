import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function createLimiter() {
  try {
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      return null
    }
    const redis = Redis.fromEnv()
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "60 s"),
      analytics: true,
      prefix: "rl:auth",
    })
  } catch {
    return null
  }
}

const limiter = createLimiter()

function ipFor(req: NextRequest) {
  return (
    req.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  )
}

const protectedPrefixes = ["/dashboard", "/companies"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      const url = req.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  }

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith("/api/auth/")) {
    if (!limiter) return NextResponse.next()

    try {
      const { success, limit, remaining, reset } = await limiter.limit(
        `ip:${ipFor(req)}`
      )
      if (!success) {
        const res = NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429 }
        )
        res.headers.set(
          "Retry-After",
          String(Math.ceil((reset - Date.now()) / 1000))
        )
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
    } catch {
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/companies/:path*",
  ],
}
