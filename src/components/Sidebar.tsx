
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { School, LayoutDashboard, Building, LogOut, PanelLeftClose, PanelRightClose, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


export const sidebarNavItems = [
  {
    isSection: true,
    title: "Overview"
  },
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    isSection: true,
    title: "Management"
  },
  {
    title: "Manage Schools",
    href: "/super-admin/dashboard/schools",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Integrations",
    href: "/super-admin/dashboard/integrations",
    icon: <Webhook className="h-5 w-5" />,
  },
];

type SidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  const NavLink = ({ item }: { item: any }) => (
     <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname.startsWith(item.href) && "bg-muted text-primary",
              isCollapsed && "justify-center"
            )}
          >
            {item.icon}
            <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>{item.title}</span>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300 h-screen sticky top-0",
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}>
      <div className={cn("flex h-16 items-center border-b", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href="/super-admin/dashboard" className="flex items-center gap-2 font-semibold">
          <School className="h-6 w-6 text-primary" />
          <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>WG Campus</span>
        </Link>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
          {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="px-4 py-4 space-y-1">
            {sidebarNavItems.map((item, index) =>
            item.isSection ? (
                <h2 key={index} className={cn("mb-2 mt-4 px-3 text-lg font-semibold tracking-tight", isCollapsed && "hidden")}>
                    {item.title}
                </h2>
            ) : (
                <NavLink key={item.href} item={item} />
            )
            )}
        </nav>
      </div>
      <div className="mt-auto p-4 space-y-4 border-t">
        <ThemeToggle isCollapsed={isCollapsed}/>
         <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href="/"
                        className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isCollapsed && "justify-center"
                        )}
                    >
                        <LogOut className="h-5 w-5" />
                        <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>Logout</span>
                    </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
            </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
