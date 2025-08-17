
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const directorSidebarNavItems = (schoolId: string) => [
  {
    section: "Academics",
    icon: <GraduationCap className="h-5 w-5" />,
    items: [
      { title: "Classes & Sections", href: `/director/dashboard/${schoolId}/academics/classes`, icon: <Presentation className="h-4 w-4" /> },
      { title: "Admissions", href: `/director/dashboard/${schoolId}/academics/admissions`, icon: <UserCheck className="h-4 w-4" /> },
      { title: "Students", href: `/director/dashboard/${schoolId}/academics/students`, icon: <Users className="h-4 w-4" /> },
      { title: "Promote Students", href: `/director/dashboard/${schoolId}/academics/promote`, icon: <FolderKanban className="h-4 w-4" /> },
      { title: "Print Center", href: `/director/dashboard/${schoolId}/academics/print`, icon: <Printer className="h-4 w-4" /> },
      { title: "Attendance", href: `/director/dashboard/${schoolId}/academics/attendance`, icon: <ClipboardList className="h-4 w-4" /> },
      { title: "Timetable", href: `/director/dashboard/${schoolId}/academics/timetable`, icon: <Calendar className="h-4 w-4" /> },
      { title: "Exams", href: `/director/dashboard/${schoolId}/academics/exams`, icon: <FileText className="h-4 w-4" /> },
      { title: "Reports", href: `/director/dashboard/${schoolId}/academics/reports`, icon: <FileText className="h-4 w-4" /> },
      { title: "E-learning", href: `/director/dashboard/${schoolId}/academics/elearning`, icon: <Book className="h-4 w-4" /> },
    ],
  },
  {
    section: "HR",
    icon: <Briefcase className="h-5 w-5" />,
    items: [
      { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory`, icon: <BookUser className="h-4 w-4" /> },
      { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/hr/attendance`, icon: <ClipboardList className="h-4 w-4" /> },
      { title: "Staff Salary", href: `/director/dashboard/${schoolId}/hr/salary`, icon: <Banknote className="h-4 w-4" /> },
      { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll`, icon: <Wallet className="h-4 w-4" /> },
    ],
  },
  {
    section: "Administration",
    icon: <Building className="h-5 w-5" />,
    items: [
      { title: "User Management", href: `/director/dashboard/${schoolId}/admin/users`, icon: <UserCog className="h-4 w-4" /> },
      { title: "Fee Structure", href: `/director/dashboard/${schoolId}/admin/fee-structure`, icon: <Banknote className="h-4 w-4" /> },
      { title: "Fees Management", href: `/director/dashboard/${schoolId}/admin/fees`, icon: <Wallet className="h-4 w-4" /> },
      { title: "Transport", href: `/director/dashboard/${schoolId}/admin/transport`, icon: <Bus className="h-4 w-4" /> },
      { title: "Library", href: `/director/dashboard/${schoolId}/admin/library`, icon: <Library className="h-4 w-4" /> },
      { title: "Hostel", href: `/director/dashboard/${schoolId}/admin/hostel`, icon: <Hotel className="h-4 w-4" /> },
      { title: "Gate Pass", href: `/director/dashboard/${schoolId}/admin/gate-pass`, icon: <Ticket className="h-4 w-4" /> },
      { title: "School Info", href: `/director/dashboard/${schoolId}/admin/info`, icon: <Info className="h-4 w-4" /> },
    ],
  },
  {
    section: "Communication",
    icon: <MessageSquare className="h-5 w-5" />,
    items: [
      { title: "Notices", href: `/director/dashboard/${schoolId}/communication/notices`, icon: <ClipboardList className="h-4 w-4" /> },
      { title: "Calendar", href: `/director/dashboard/${schoolId}/communication/calendar`, icon: <Calendar className="h-4 w-4" /> },
      { title: "Messaging", href: `/director/dashboard/${schoolId}/communication/messaging`, icon: <MessageSquare className="h-4 w-4" /> },
    ],
  },
  {
    section: "Accountant Menu",
    icon: <PersonStanding className="h-5 w-5" />,
    items: [
      { title: "Fee Structure", href: `/director/dashboard/${schoolId}/accountant/fee-structure`, icon: <Banknote className="h-4 w-4" /> },
      { title: "Payroll Processing", href: `/director/dashboard/${schoolId}/accountant/payroll`, icon: <Wallet className="h-4 w-4" /> },
    ],
  },
  {
    section: "Parent Menu",
    icon: <Users className="h-5 w-5" />,
    items: [
      { title: "Dashboard", href: `/director/dashboard/${schoolId}/parent/dashboard`, icon: <LayoutDashboard className="h-4 w-4" /> },
      { title: "Child's Profile", href: `/director/dashboard/${schoolId}/parent/profile`, icon: <UserCheck className="h-4 w-4" /> },
      { title: "Attendance", href: `/director/dashboard/${schoolId}/parent/attendance`, icon: <ClipboardList className="h-4 w-4" /> },
      { title: "Fees", href: `/director/dashboard/${schoolId}/parent/fees`, icon: <Wallet className="h-4 w-4" /> },
      { title: "Report Cards", href: `/director/dashboard/${schoolId}/parent/reports`, icon: <FileText className="h-4 w-4" /> },
      { title: "E-learning", href: `/director/dashboard/${schoolId}/parent/elearning`, icon: <Book className="h-4 w-4" /> },
      { title: "School Calendar", href: `/director/dashboard/${schoolId}/parent/calendar`, icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    section: "Librarian Menu",
    icon: <BookUser className="h-5 w-5" />,
    items: [
      { title: "Library Management", href: `/director/dashboard/${schoolId}/librarian/management`, icon: <Library className="h-4 w-4" /> },
    ],
  },
];


type SidebarProps = {
  schoolId: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function DirectorSidebar({ schoolId, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({'Academics': true, 'HR': true, 'Administration': true});

  const navItems = useMemo(() => directorSidebarNavItems(schoolId), [schoolId]);

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

  return (
    <div className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}>
      <div className={cn("flex h-16 items-center border-b", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href={`/director/dashboard/${schoolId}`} className="flex items-center gap-2 font-semibold">
          <School className="h-6 w-6 text-primary" />
          <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>WG Campus</span>
        </Link>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
          {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <NavLink item={{ title: "Dashboard", href: `/director/dashboard/${schoolId}`, icon: <LayoutDashboard className="h-5 w-5" /> }} />
        
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
