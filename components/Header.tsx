"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Logo from "./Logo"
import { useSession } from "next-auth/react"
import { IconChevronDown, IconUserCircle, IconLogout, IconTipJar } from "@tabler/icons-react"
import { signOutAndRedirect } from "@/lib/signout"
import { capitalizeFirst } from "@/lib/capitalizefirst"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

// -----------------------
// Config
// -----------------------
const menuItems = [
  { title: "Features", href: "/#features" },
  { title: "About", href: "/#about" },
  { title: "Pricing", href: "/#pricing" },
  { title: "Contribute", href: "/#contribute" },
]

// -----------------------
// Stable scroll spy hook
// -----------------------
function useActiveSection(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!ids.length) return

    const headerVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-height")
    const headerHeight = parseInt(headerVar || "0", 10) || 64
    const offset = headerHeight + 8

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    const update = () => {
      const scrollY = window.scrollY
      const viewportTop = scrollY + offset
      const viewportCenter = viewportTop + window.innerHeight * 0.25

      if (!sections.length) {
        setActive(null)
        return
      }

      const firstTop = sections[0].offsetTop

      // Reset above hero
      if (viewportTop < firstTop) {
        setActive(null)
        return
      }

      // Pick closest section to center
      let bestId: string | null = null
      let bestDist = Infinity

      for (const s of sections) {
        const sectionCenter = s.offsetTop + s.offsetHeight / 2
        const dist = Math.abs(sectionCenter - viewportCenter)
        if (dist < bestDist) {
          bestDist = dist
          bestId = s.id
        }
      }

      setActive(bestId)
    }

    const onScroll = () => requestAnimationFrame(update)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [ids])

  return { active, setActive }
}

// -----------------------
// Mobile burger helpers
// -----------------------
function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

type BurgerMenuProps = {
  active: string | null
  setActive: (v: string) => void
  isHome: boolean
  hrefFor: (href: string) => string
  onAnchorClick: (e: React.MouseEvent, href: string) => void
}

const BurgerMenu = ({
  active,
  setActive,
  isHome,
  hrefFor,
  onAnchorClick,
}: {
  active: string | null
  setActive: (v: string) => void
  isHome: boolean
  hrefFor: (href: string) => string
  onAnchorClick: (e: React.MouseEvent, href: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()        // <-- call once, here
  const router = useRouter()
  useLockBody(open)

  return (
    <>
      {/* Trigger */}
      <button
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[110] flex h-10 w-10 flex-col items-center justify-center lg:hidden"
      >
        <span className={`block h-1 w-8 rounded bg-current transition-transform duration-300 ${open ? "translate-y-[7.5px] rotate-45" : ""}`} />
        <span className={`my-1 block h-1 w-8 rounded bg-current transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
        <span className={`block h-1 w-8 rounded bg-current transition-transform duration-300 ${open ? "-translate-y-[9px] -rotate-45" : ""}`} />
      </button>

      {/* Overlay */}
      <nav
        className={[
          "fixed inset-0 z-[100] lg:hidden",
          "h-dvh w-screen",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 backdrop-blur-sm bg-background/70 supports-[backdrop-filter]:bg-background/40"
        />
        <ul className="relative z-[101] flex h-full flex-col items-center justify-center gap-8 bg-background px-6 text-lg font-semibold text-foreground">
          {menuItems.map((item) => {
            const id = item.href.slice(2)
            const isActive = active === id
            const finalHref = hrefFor(item.href)
            return (
              <li key={item.title}>
                <Link
                  href={finalHref}
                  onClick={(e) => {
                    onAnchorClick(e, item.href)
                    setActive(id)
                    setOpen(false)
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-colors hover:text-primary ${isActive ? "underline underline-offset-8 decoration-2" : ""}`}
                >
                  {item.title}
                </Link>
              </li>
            )
          })}


          <Link href="/donate" className="flex items-center gap-1">
            <Button className="p-2" onClick={() => setOpen(false)}>
              <IconTipJar className="h-5 w-5" />
              <span>Donate</span>
            </Button>
          </Link>


          {!session ? (
            <div className="mt-4 flex items-center gap-4">
              <Button asChild variant="outline" className="shadow-none" onClick={() => setOpen(false)}>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <>
              <li>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-lg"
                >
                  <IconUserCircle className="h-8 w-8 rounded-full mr-1" />
                  {/* use the session we already read */}
                  <span>{capitalizeFirst(session.user?.name)}</span>
                </Link>
              </li>
              <li>
                <Button
                  onClick={() => {
                    setOpen(false)
                    signOutAndRedirect(router)
                  }}
                >
                  Logout
                </Button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  )
}


// -----------------------
// Header
// -----------------------
const Header = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === "/"

  // sectionIds from menu items, remove "/#"
  const sectionIds = useMemo(() => menuItems.map((m) => m.href.slice(2)), [])
  const { active, setActive } = useActiveSection(sectionIds)

  // Turn "/#features" -> "#features" if already on "/"
  const hrefFor = (href: string) => (isHome ? href.replace("/#", "#") : href)

  // Smooth-scroll on home, normal Link behavior elsewhere
  const handleAnchorClick = (e: React.MouseEvent, originalHref: string) => {
    if (!isHome) return
    const hash = originalHref.replace("/#", "#")
    if (!hash.startsWith("#")) return
    e.preventDefault()
    const id = hash.slice(1)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActive(id)
      history.replaceState(null, "", hash) // update URL without navigation
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[var(--header-height)] py-1">
      <div className="container flex h-full items-center justify-between px-4">
        <Logo />

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {menuItems.map((item) => {
            const id = item.href.slice(2) // "features"
            const isActive = active === id
            const finalHref = hrefFor(item.href)
            return (
              <li key={item.title}>
                <Link
                  href={finalHref}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-colors hover:text-primary ${isActive
                    ? "text-foreground underline underline-offset-8 decoration-2"
                    : "text-muted-foreground"
                    }`}
                >
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">

          <Link href="/donate" className="flex items-center gap-1">
            <Button className="p-2">
              <IconTipJar className="h-5 w-5" />
              <span>Donate</span>
            </Button>
          </Link>

          {!session ? (
            <>
              <Button asChild variant="outline" className="shadow-none">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <span>{capitalizeFirst(session?.user?.name)}</span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <IconUserCircle />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOutAndRedirect(router)}>
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile burger */}
        <BurgerMenu
          active={active}
          setActive={setActive}
          isHome={isHome}
          hrefFor={hrefFor}
          onAnchorClick={handleAnchorClick}
        />
      </div>
    </header >
  )
}

export default Header
