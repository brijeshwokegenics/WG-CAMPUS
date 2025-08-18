
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  School,
  LayoutDashboard,
  PanelLeftClose,
  PanelRightClose,
  ChevronDown,
  Book,
  ClipboardList,
  Calendar,
  FileText,
  MessageSquare,
  GraduationCap,
  Presentation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const getTeacherNavItems = (schoolId: string) => {
    return [
      {
        section: "Academics",
        icon: <GraduationCap className="h-5 w-5" />,
        items: [
          { title: "Classes & Sections", href: `/teacher/${schoolId}/academics/classes`, icon: <Presentation className="h-4 w-4" /> },
          { title: "Attendance", href: `/teacher/${schoolId}/academics/attendance`, icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Timetable", href: `/teacher/${schoolId}/academics/timetable`, icon: <Calendar className="h-4 w-4" /> },
          { title: "Exams", href: `/teacher/${schoolId}/academics/exams`, icon: <FileText className="h-4 w-4" /> },
          { title: "Reports", href: `/teacher/${schoolId}/academics/reports`, icon: <FileText className="h-4 w-4" /> },
          { title: "E-learning", href: `/teacher/${schoolId}/academics/elearning`, icon: <Book className="h-4 w-4" /> },
        ],
      },
      {
        section: "Communication",
        icon: <MessageSquare className="h-5 w-5" />,
        items: [
          { title: "Notices", href: `/teacher/${schoolId}/communication/notices`, icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Calendar", href: `/teacher/${schoolId}/communication/calendar`, icon: <Calendar className="h-4 w-4" /> },
          { title: "Messaging", href: `/teacher/${schoolId}/communication/messaging`, icon: <MessageSquare className="h-4 w-4" /> },
        ],
      },
    ];
};

type SidebarProps = {
  schoolId: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function TeacherSidebar({ schoolId, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({'Academics': true, 'Communication': true });
  
  const navItems = getTeacherNavItems(schoolId);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const NavLink = ({ item, isSubItem = false }: { item: any; isSubItem?: boolean }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary",
              isCollapsed && "justify-center",
              isSubItem && "text-sm"
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

  const dashboardLink = `/teacher/${schoolId}/dashboard`;

  return (
    <div className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300",
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
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <NavLink item={{ title: "Dashboard", href: dashboardLink, icon: <LayoutDashboard className="h-5 w-5" /> }} />
        
        {navItems.map((section) => (
          <div key={section.section}>
            {isCollapsed ? (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                           <Button
                                variant="ghost"
                                size="icon"
                                className="w-full flex justify-center items-center"
                                onClick={toggleSidebar}
                            >
                                {section.icon}
                                <span className="sr-only">{section.section}</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{section.section}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-between items-center px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                onClick={() => toggleSection(section.section)}
              >
                <div className="flex items-center gap-3">
                    {section.icon}
                    <span>{section.section}</span>
                </div>
                <ChevronDown className={cn("h-5 w-5 transition-transform", openSections[section.section] ? 'rotate-180' : '')} />
              </Button>
            )}

            {!isCollapsed && openSections[section.section] && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-muted ml-4">
                {section.items.map((item) => (
                    <NavLink key={item.href} item={item} isSubItem={true} />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
