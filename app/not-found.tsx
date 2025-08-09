"use client";

import Link from "next/link";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
      <IconAlertTriangle
        size={64}
        className="text-yellow-500 mb-4 animate-bounce"
        stroke={1.5}
      />
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">404 – Page Not Found or Still In Development</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Sorry, this page doesn’t exist yet — it’s still in development.
        Check back soon!
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <IconArrowLeft size={18} stroke={1.5} />
        Back to Home
      </Link>
    </div>
  );
}
