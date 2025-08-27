
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  School,
  LayoutDashboard,
  Building,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  ChevronDown,
  Users,
  Book,
  ClipboardList,
  Calendar,
  Bus,
  Library,
  GraduationCap,
  Briefcase,
  Wallet,
  UserCheck,
  FileText,
  MessageSquare,
  Hotel,
  Ticket,
  Info,
  Banknote,
  Presentation,
  UserCog,
  Warehouse,
  FolderKanban,
  PersonStanding,
  BookUser,
  Printer,
  Webhook,
  BookCheck,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const getNavItems = (schoolId: string) => {
    
    return [
      {
        section: "Academics",
        icon: <GraduationCap className="h-5 w-5" />,
        items: [
          { title: "Classes & Sections", href: `/principal/${schoolId}/academics/classes`, icon: <Presentation className="h-4 w-4" /> },
          { title: "Admissions", href: `/principal/${schoolId}/academics/admissions`, icon: <UserCheck className="h-4 w-4" /> },
          { title: "Students", href: `/principal/${schoolId}/academics/students`, icon: <Users className="h-4 w-4" /> },
          { title: "Promote Students", href: `/principal/${schoolId}/academics/promote`, icon: <FolderKanban className="h-4 w-4" /> },
          { title: "Print Center", href: `/principal/${schoolId}/academics/print`, icon: <Printer className="h-4 w-4" /> },
          { title: "Attendance", href: `/principal/${schoolId}/academics/attendance`, icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Timetable", href: `/principal/${schoolId}/academics/timetable`, icon: <Calendar className="h-4 w-4" /> },
          { title: "Exams", href: `/principal/${schoolId}/academics/exams`, icon: <FileText className="h-4 w-4" /> },
          { title: "Reports", href: `/principal/${schoolId}/academics/reports`, icon: <FileText className="h-4 w-4" /> },
          { title: "E-learning", href: `/principal/${schoolId}/academics/elearning`, icon: <Book className="h-4 w-4" /> },
        ],
      },
      {
        section: "HR",
        icon: <Briefcase className="h-5 w-5" />,
        items: [
          { title: "HR Dashboard", href: `/principal/${schoolId}/hr/dashboard`, icon: <LayoutDashboard className="h-4 w-4" />},
          { title: "Staff Directory", href: `/principal/${schoolId}/hr/directory`, icon: <BookUser className="h-4 w-4" /> },
          { title: "Staff Attendance", href: `/principal/${schoolId}/hr/attendance`, icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Staff Salary", href: `/principal/${schoolId}/hr/salary`, icon: <Banknote className="h-4 w-4" /> },
          { title: "Payroll", href: `/principal/${schoolId}/hr/payroll`, icon: <Wallet className="h-4 w-4" /> },
        ],
      },
      {
        section: "Administration",
        icon: <Building className="h-5 w-5" />,
        items: [
          { title: "Admin Dashboard", href: `/principal/${schoolId}/admin/dashboard`, icon: <LayoutDashboard className="h-4 w-4" />},
          { title: "Fee Structure", href: `/principal/${schoolId}/admin/fee-structure`, icon: <Banknote className="h-4 w-4" /> },
          { title: "Fees Management", href: `/principal/${schoolId}/admin/fees`, icon: <Wallet className="h-4 w-4" /> },
          { title: "Expense Management", href: `/principal/${schoolId}/admin/expenses`, icon: <Receipt className="h-4 w-4" /> },
          { title: "Inventory", href: `/principal/${schoolId}/admin/inventory`, icon: <Warehouse className="h-4 w-4" /> },
          { title: "Transport", href: `/principal/${schoolId}/admin/transport`, icon: <Bus className="h-4 w-4" /> },
          { title: "Library", href: `/principal/${schoolId}/admin/library`, icon: <Library className="h-4 w-4" /> },
          { title: "Hostel", href: `/principal/${schoolId}/admin/hostel`, icon: <Hotel className="h-4 w-4" /> },
          { title: "Gate Pass", href: `/principal/${schoolId}/admin/gate-pass`, icon: <Ticket className="h-4 w-4" /> },
          { title: "School Info", href: `/principal/${schoolId}/school-info`, icon: <Info className="h-4 w-4" /> },
        ],
      },
      {
        section: "Communication",
        icon: <MessageSquare className="h-5 w-5" />,
        items: [
          { title: "Notices", href: `/principal/${schoolId}/communication/notices`, icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Calendar", href: `/principal/${schoolId}/communication/calendar`, icon: <Calendar className="h-4 w-4" /> },
          { title: "Messaging", href: `/principal/${schoolId}/communication/messaging`, icon: <MessageSquare className="h-4 w-4" /> },
        ],
      },
    ];
}


type SidebarProps = {
  schoolId: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function PrincipalSidebar({ schoolId, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({'Academics': true, 'HR': true, 'Administration': true, 'Communication': true });
  
  const navItems = getNavItems(schoolId);

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
        <nav className="px-2 py-4 space-y-2">
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
                                 onClick={() => !isCollapsed && toggleSection(section.section)}
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
    </div>
  );
}
