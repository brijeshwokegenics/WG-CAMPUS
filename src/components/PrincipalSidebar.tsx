
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  School,
  LayoutDashboard,
  PanelLeftClose,
  PanelRightClose,
  Users,
  ClipboardList,
  Calendar,
  Building,
  User,
  Presentation
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


const getNavItems = (schoolId: string) => {
    return [
        { title: "Dashboard", href: `/principal/${schoolId}/dashboard`, icon: <LayoutDashboard className="h-5 w-5" /> },
        { title: "Student Management", href: `/director/dashboard/${schoolId}/academics/students`, icon: <Users className="h-5 w-5" /> },
        { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory`, icon: <User className="h-5 w-5" /> },
        { title: "School Information", href: `/principal/${schoolId}/school-info`, icon: <Building className="h-5 w-5" /> },
        { title: "Classes & Sections", href: `/director/dashboard/${schoolId}/academics/classes`, icon: <Presentation className="h-5 w-5" /> },
        { title: "Attendance", href: `/director/dashboard/${schoolId}/academics/attendance`, icon: <ClipboardList className="h-5 w-5" /> },
        { title: "Timetable", href: `/director/dashboard/${schoolId}/academics/timetable`, icon: <Calendar className="h-5 w-5" /> },
    ];
};

type SidebarProps = {
  schoolId: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function PrincipalSidebar({ schoolId, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(schoolId);

  const NavLink = ({ item }: { item: any; isSubItem?: boolean }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary",
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

  const dashboardLink = `/principal/${schoolId}/dashboard`;


  return (
    <div className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300 h-screen sticky top-0",
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}>
      <div className={cn("flex h-16 items-center border-b", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href={dashboardLink} className="flex items-center gap-2 font-semibold">
          <School className="h-6 w-6 text-primary" />
          <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>WG Campus</span>
        </Link>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
          {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
        </nav>
      </div>
    </div>
  );
}
