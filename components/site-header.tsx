"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"


export function SiteHeader() {
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
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Welcome back {session?.user?.name || "..."}! This is your <span className="font-bold">{companyName || "..."}</span> campaign!</h1>

      </div>
    </header>
  )
}
