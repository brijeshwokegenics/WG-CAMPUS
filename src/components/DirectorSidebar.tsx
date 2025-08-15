
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useMemo } from "react";
import { 
    School, 
    LayoutDashboard, 
    LogOut, 
    Building, 
    Users, 
    Briefcase,
    GraduationCap,
    BarChart2,
    Wallet,
    Megaphone,
    CalendarCheck,
    FileText,
    Bus,
    Users2,
    BookCopy,
    BookMarked,
    AreaChart,
    PieChart,
    BellDot,
    CalendarClock,
    GanttChartSquare,
    ClipboardCheck,
    CircleDollarSign,
    Receipt,
    ListFilter,
    MessageSquare,
    Mail,
    Presentation,
    LineChart,
    FileCog,
    Map,
    ShieldAlert,
    CheckCircle,
    KeyRound,
    History,
    PanelLeftClose,
    PanelRightClose,
    UserCheck,
    Smartphone,
    UserPlus,
    TrendingUp,
    CalendarDays,
    MonitorPlay,
    Contact,
    Banknote,
    FileStack,
    Boxes,
    Library,
    BedDouble,
    Ticket,
    Calendar,
    User,
    Award,
    BookOpen,
    ChevronDown,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useSchool } from "@/context/SchoolProvider";

export const directorSidebarNavItems = (schoolId: string) => [
    {
      section: "Academics",
      icon: <GraduationCap className="h-5 w-5" />,
      items: [
        { title: "Classes & Sections", href: `/director/dashboard/${schoolId}/academics/classes`, icon: <BookMarked className="h-5 w-5" /> },
        { title: "Admissions", href: `/director/dashboard/${schoolId}/academics/admissions`, icon: <UserPlus className="h-5 w-5" /> },
        { title: "Students", href: `/director/dashboard/${schoolId}/academics/students`, icon: <Users className="h-5 w-5" /> },
        { title: "Promote Students", href: `/director/dashboard/${schoolId}/academics/promote`, icon: <TrendingUp className="h-5 w-5" /> },
        { title: "Attendance", href: `/director/dashboard/${schoolId}/academics/attendance`, icon: <UserCheck className="h-5 w-5" /> },
        { title: "Timetable", href: `/director/dashboard/${schoolId}/academics/timetable`, icon: <CalendarDays className="h-5 w-5" /> },
        { title: "Exams", href: `/director/dashboard/${schoolId}/academics/exams`, icon: <FileText className="h-5 w-5" /> },
        { title: "Reports", href: `/director/dashboard/${schoolId}/academics/reports`, icon: <BarChart2 className="h-5 w-5" /> },
        { title: "E-learning", href: `/director/dashboard/${schoolId}/academics/e-learning`, icon: <MonitorPlay className="h-5 w-5" /> },
      ]
    },
    {
      section: "HR",
      icon: <Briefcase className="h-5 w-5" />,
      items: [
        { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory`, icon: <Contact className="h-5 w-5" /> },
        { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/hr/attendance`, icon: <ClipboardCheck className="h-5 w-5" /> },
        { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll`, icon: <Wallet className="h-5 w-5" /> },
        { title: "Staff Salary", href: `/director/dashboard/${schoolId}/hr/salary`, icon: <Banknote className="h-5 w-5" /> },
      ]
    },
    {
      section: "Administration",
      icon: <Building className="h-5 w-5" />,
      items: [
        { title: "User Management", href: `/director/dashboard/${schoolId}/admin/users`, icon: <Users2 className="h-5 w-5" /> },
        { title: "Fees", href: `/director/dashboard/${schoolId}/admin/fees`, icon: <CircleDollarSign className="h-5 w-5" /> },
        { title: "Fee Structure", href: `/director/dashboard/${schoolId}/admin/fee-structure`, icon: <FileStack className="h-5 w-5" /> },
        { title: "Inventory", href: `/director/dashboard/${schoolId}/admin/inventory`, icon: <Boxes className="h-5 w-5" /> },
        { title: "Transport", href: `/director/dashboard/${schoolId}/admin/transport`, icon: <Bus className="h-5 w-5" /> },
        { title: "Library", href: `/director/dashboard/${schoolId}/admin/library`, icon: <Library className="h-5 w-5" /> },
        { title: "Hostel", href: `/director/dashboard/${schoolId}/admin/hostel`, icon: <BedDouble className="h-5 w-5" /> },
        { title: "Gate Pass", href: `/director/dashboard/${schoolId}/admin/gate-pass`, icon: <Ticket className="h-5 w-5" /> },
        { title: "School Info", href: `/director/dashboard/${schoolId}/profile`, icon: <Building className="h-5 w-5" /> },
      ]
    },
    {
      section: "Communication",
      icon: <Megaphone className="h-5 w-5" />,
      items: [
        { title: "Notices", href: `/director/dashboard/${schoolId}/communication/notices`, icon: <Megaphone className="h-5 w-5" /> },
        { title: "Calendar", href: `/director/dashboard/${schoolId}/communication/calendar`, icon: <Calendar className="h-5 w-5" /> },
        { title: "Messaging", href: `/director/dashboard/${schoolId}/communication/messaging`, icon: <MessageSquare className="h-5 w-5" /> },
      ]
    },
    {
      section: "Accountant Menu",
      icon: <Wallet className="h-5 w-5" />,
      items: [
        { title: "Fees Management", href: `/director/dashboard/${schoolId}/accountant/fees`, icon: <Wallet className="h-5 w-5" /> },
        { title: "Fee Structure", href: `/director/dashboard/${schoolId}/accountant/fee-structure`, icon: <FileStack className="h-5 w-5" /> },
        { title: "Payroll Processing", href: `/director/dashboard/${schoolId}/accountant/payroll`, icon: <Receipt className="h-5 w-5" /> },
      ]
    },
    {
      section: "Parent Menu",
      icon: <Users className="h-5 w-5" />,
      items: [
        { title: "Dashboard", href: `/director/dashboard/${schoolId}/parent/dashboard`, icon: <LayoutDashboard className="h-5 w-5" /> },
        { title: "Child's Profile", href: `/director/dashboard/${schoolId}/parent/child-profile`, icon: <User className="h-5 w-5" /> },
        { title: "Attendance", href: `/director/dashboard/${schoolId}/parent/attendance`, icon: <UserCheck className="h-5 w-5" /> },
        { title: "Fees", href: `/director/dashboard/${schoolId}/parent/fees`, icon: <CircleDollarSign className="h-5 w-5" /> },
        { title: "Report Cards", href: `/director/dashboard/${schoolId}/parent/reports`, icon: <Award className="h-5 w-5" /> },
        { title: "E-learning", href: `/director/dashboard/${schoolId}/parent/e-learning`, icon: <MonitorPlay className="h-5 w-5" /> },
        { title: "School Calendar", href: `/director/dashboard/${schoolId}/parent/calendar`, icon: <Calendar className="h-5 w-5" /> },
      ]
    },
    {
      section: "Librarian Menu",
      icon: <BookOpen className="h-5 w-5" />,
      items: [
          { title: "Library Management", href: `/director/dashboard/${schoolId}/librarian/management`, icon: <BookOpen className="h-5 w-5" /> },
      ]
    }
];

type DirectorSidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function DirectorSidebar({ isCollapsed, toggleSidebar }: DirectorSidebarProps) {
  const pathname = usePathname();
  const { schoolId } = useSchool();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const navItems = useMemo(() => {
    if (!schoolId) return [];
    return directorSidebarNavItems(schoolId);
  }, [schoolId]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const NavLink = ({ item, isSubItem = false }: { item: any, isSubItem?: boolean }) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary",
              isCollapsed && "justify-center",
              isSubItem && "pl-8"
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
         <Link href={schoolId ? `/director/dashboard/${schoolId}` : '#'} className="flex items-center gap-2 font-semibold">
          <School className="h-6 w-6 text-primary" />
          <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>WG Campus</span>
        </Link>
         <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
          {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 py-4 text-sm font-medium">
          {navItems.map((section, index) => (
            <div key={index} className="space-y-1">
              {isCollapsed ? (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center items-center h-10 w-10">
                        {section.icon}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">{section.section}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-between items-center px-3 py-2 text-base font-semibold text-foreground hover:bg-muted"
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
                <div className="pl-4 border-l-2 border-muted-foreground/20 ml-4">
                  {section.items.map((item, itemIndex) => (
                     item.href && <NavLink key={itemIndex} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 space-y-4 border-t">
         <ThemeToggle isCollapsed={isCollapsed} />
         <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href="/school/login"
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

    