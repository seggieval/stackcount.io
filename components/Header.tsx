"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "./Logo"
import ThemeToggle from "./ThemeToggle"
import { useSession } from "next-auth/react"
import { IconChevronDown, IconUserCircle, IconLogout } from '@tabler/icons-react';
import { useRouter } from "next/navigation"
import { signOutAndRedirect } from "@/lib/signout"
import { capitalizeFirst } from "@/lib/capitalizefirst"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"


const BurgerMenu = () => {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter();

  const menuItems = ["products", "pricing", "api"]

  return (
    <>
      <button
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="z-50 relative flex flex-col justify-center items-center w-10 h-10 group lg:hidden"
      >
        <span
          className={`block h-1 w-8 bg-current rounded transition-transform duration-300 ease-in-out ${open ? "rotate-45 translate-y-[7.5px]" : ""}`}
        />
        <span
          className={`block h-1 w-8 bg-current rounded my-1 transition-opacity duration-300 ease-in-out ${open ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`block h-1 w-8 bg-current rounded transition-transform duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-[9px]" : ""}`}
        />
      </button>

      <nav
        className={`fixed top-0 left-0 h-full w-full backdrop-blur-sm transform transition-all duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} lg:hidden bg-white/90 dark:bg-black/90`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col items-center justify-center h-full gap-8 text-lg font-semibold font-title text-black dark:text-white transition-colors duration-300">
          {menuItems.map((item) => (
            <li key={item}>
              <Link href={`/${item}`} onClick={() => setOpen(false)}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            </li>
          ))}

          {!session ? (
            <div className="order-last flex items-center gap-4">
              <Button>
                <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
              </Button>
              <Button variant="default">
                <Link href="/register" onClick={() => setOpen(false)}>Sign Up</Link>
              </Button>
            </div>
          ) : (
            <>
              <li>
                <Link href="/dashboard" className="flex items-center space-x-2 text-black dark:text-white font-title text-lg font-semibold transition-colors duration-300">
                  <IconUserCircle className="w-8 h-8 rounded-full mr-1!" />
                  <span className="">{capitalizeFirst(session?.user?.name)}</span>
                </Link>
              </li>
              <li>
                <Button onClick={() => signOutAndRedirect(router)}>
                  Logout
                </Button>
              </li>
            </>
          )}

          <div className="absolute left-4 top-4">
            <ThemeToggle />
          </div>
        </ul>
      </nav>
    </>
  )
}

const Header = () => {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <header className="flex items-center justify-between p-4 container relative z-50">
      <Logo />
      <ul className="hidden lg:flex space-x-8 text-lg font-semibold font-title text-muted-foreground">
        {["products", "pricing", "api"].map((item) => (
          <li key={item}>
            <Link href={`/${item}`} className="hover:text-primary">
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden lg:flex items-center space-x-4">
        <ThemeToggle />
        {!session ? (
          <>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-transparent! bg-transparent! text-primary hover:bg-primary! hover:text-secondary hover:border-primary! shadow-none"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="default">Sign Up</Button>
            </Link>
          </>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-primary font-title text-lg font-semibold transition-colors duration-300 group gap-1!">
                  <span className="mr-0!">{capitalizeFirst(session?.user?.name)}</span>
                  <IconChevronDown className="w-4 h-4 text-muted-foreground ml-0! group-hover:text-primary transition-colors duration-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
              >
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
          </>
        )}
      </div>

      {/* Burger menu visible only on mobile */}
      <BurgerMenu />
    </header>
  )
}

export default Header
