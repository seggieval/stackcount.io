import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://stackcount.io"

  // ✅ list all your key static routes
  const staticRoutes = [
    "",            // homepage
    "/#features",
    "/donate",
    "/#about",
    "/#contribute",
    "/#pricing"
  ]

  // TODO: if you have dynamic blog posts or case studies, 
  // fetch them here (from DB, CMS, or filesystem) and push to this array.

  return staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),   // always mark fresh on deploy
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }))
}
