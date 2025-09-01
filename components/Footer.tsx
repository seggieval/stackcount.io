"use client"

import Link from "next/link"

export default function Footer({ className }: { className?: string }) {
  return (
    <footer className={`border-t py-8 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">

        {/* Left side */}
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} stackCount.io. All rights reserved.
        </p>

        {/* Right side nav */}
        <nav className="flex items-center gap-6">
          <Link href="/#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/#about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/#pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/#contribute" className="hover:text-primary transition-colors">
            Contribute
          </Link>
          {/* <Link
            href="https://github.com/yourrepo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </Link> */}
        </nav>
      </div>
    </footer>
  )
}
