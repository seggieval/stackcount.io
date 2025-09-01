"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconSettings,
  IconCreditCardPay,
  IconNotes,
  IconSparkles
} from "@tabler/icons-react"

import { useParams } from "next/navigation"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavSecondary } from "@/components/dashboard/nav-secondary"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Logo from "../Logo"
import ExportCSVDialog from "./ExportCSVDialog"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { companyId } = useParams();

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
    },
    navMain: [
      {
        title: "Dashboard",
        url: `/companies/${companyId}/dashboard`,
        icon: IconDashboard,
      },
      {
        title: "Transactions",
        url: `/companies/${companyId}/transactions`,
        icon: IconCreditCardPay,
      },
      {
        title: "Notes",
        url: `/companies/${companyId}/notes`,
        icon: IconNotes,
      },
      {
        title: "Analyze",
        url: `/companies/${companyId}/analyze`,
        icon: IconSparkles,
      },
      {
        title: "Tax Calculator",
        url: `/companies/${companyId}/tax-calculator`,
        icon: IconChartBar,
      },

      {
        title: "Your Companies",
        url: "/companies",
        icon: IconFolder,
        separator: true,
      },
    ],
    navSecondary: [
      // {
      //   title: "Settings",
      //   url: "#",
      //   icon: IconSettings,
      // },
    ],
    navClouds: [],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2">
              <Logo className="text-4xl sm:text-4xl" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary ? data.navSecondary : []} className="mt-auto" /> */}
        <ExportCSVDialog companyId={companyId} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
