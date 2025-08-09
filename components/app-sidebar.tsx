"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconSettings,
  IconCreditCardPay,
  IconNotes
} from "@tabler/icons-react"

import { useParams } from "next/navigation"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import ThemeToggle from "./ThemeToggle"
import Logo from "./Logo"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { companyId } = useParams();

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
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
        title: "Tax Calculator",
        url: `/companies/${companyId}/tax-calculator`,
        icon: IconChartBar,
      },
      {
        title: "Your Companies",
        url: "/companies",
        icon: IconFolder,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: IconSettings,
      },
    ],
    navClouds: [],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2">
              <Logo className="text-2xl sm:text-[28px]" />
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
