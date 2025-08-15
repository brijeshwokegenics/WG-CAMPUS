"use client"
import Link from "next/link"
import {
  Bell,
  BookUser,
  Building,
  ChevronDown,
  LayoutDashboard,
  School,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { Logo } from "@/components/logo"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="flex flex-col">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <Logo />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold -mb-1">WG CAMPUS</h2>
                <p className="text-xs text-muted-foreground">School Management</p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarMenu className="flex-1 px-4">
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive>
                <LayoutDashboard />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <p className="text-xs text-muted-foreground px-2 pt-4 pb-1 font-semibold">Management</p>

            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/create-school">
                <ShieldCheck />
                Create School
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/create-principal">
                <UserCog />
                Create Principal
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/create-staff">
                <Users />
                Create Staff
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard/create-parent">
                <UserPlus />
                Create Parent
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Add a search bar if needed in the future */}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <UserNav />
          </header>
          <main className="flex-1 p-4 lg:p-6 bg-background">
            {children}
          </main>
        </SidebarInset>
      </Sidebar>
    </SidebarProvider>
  )
}
