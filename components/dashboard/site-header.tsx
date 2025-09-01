"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { capitalizeFirst } from "@/lib/capitalizefirst";


export function SiteHeader({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { companyId } = useParams();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (!companyId) return;
    const fetchCompany = async () => {
      const res = await fetch(`/api/companies/${companyId}`);
      if (!res.ok) return;
      const data = await res.json();
      setCompanyName(data.name);
    };
    fetchCompany();
  }, [companyId]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <header
      className={cn(
        // stickiness
        "sticky top-0 z-40",
        // visuals
        "bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-b",
        // layout
        "flex h-(--header-height) shrink-0 items-center gap-2",
        // smooth height/width changes if your --header-height changes
        "transition-[width,height] ease-linear",
        // if you use the sidebar wrapper data attr
        "group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        className
      )}
      style={{
        // if you have not set this var elsewhere, set a sensible default:
        // @ts-ignore
        ['--header-height' as any]: '56px',
        // iOS notch safe-area padding (optional)
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">
          Welcome back <span className="font-bold">{capitalizeFirst(session?.user?.name) || "..."}</span>! This is your{" "}
          <span className="font-bold">{capitalizeFirst(companyName) || "..."}</span> campaign!
        </h1>
      </div>
    </header>

  )
}
