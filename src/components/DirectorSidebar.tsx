
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useMemo } from "react";
import { 
    School, 
    LayoutDashboard, 
    GraduationCap,
    BookMarked,
    UserPlus,
    Users,
    TrendingUp,
    UserCheck,
    CalendarDays,
    FileText,
    MonitorPlay,
    Briefcase,
    Contact,
    ClipboardCheck,
    Wallet,
    Banknote,
    Building,
    Users2,
    CircleDollarSign,
    FileStack,
    Boxes,
    Bus,
    Library,
    BedDouble,
    Ticket,
    Settings,
    Megaphone,
    Calendar,
    MessageSquare,
    UserCircle,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Avatar, AvatarFallback } from "./ui/avatar";


const directorSidebarNavItems = (schoolId: string) => [
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
        { title: "Reports", href: `/director/dashboard/${schoolId}/academics/reports`, icon: <MonitorPlay className="h-5 w-5" /> },
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
        { title: "School Info", href: `/director/dashboard/${schoolId}/profile`, icon: <Settings className="h-5 w-5" /> },
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
          { title: "Fees Management", href: `/director/dashboard/${schoolId}/accountant/fees`, icon: <CircleDollarSign className="h-5 w-5" /> },
          { title: "Fee Structure", href: `/director/dashboard/${schoolId}/accountant/fee-structure`, icon: <FileStack className="h-5 w-5" /> },
          { title: "Payroll Processing", href: `/director/dashboard/${schoolId}/accountant/payroll`, icon: <Banknote className="h-5 w-5" /> },
        ],
    },
    {
        section: "Parent Menu",
        icon: <Users className="h-5 w-5" />,
        items: [
            { title: "Dashboard", href: `/director/dashboard/${schoolId}/parent/dashboard`, icon: <LayoutDashboard className="h-5 w-5" /> },
            { title: "Child's Profile", href: `/director/dashboard/${schoolId}/parent/profile`, icon: <UserCircle className="h-5 w-5" /> },
            { title: "Attendance", href: `/director/dashboard/${schoolId}/parent/attendance`, icon: <UserCheck className="h-5 w-5" /> },
            { title: "Fees", href: `/director/dashboard/${schoolId}/parent/fees`, icon: <CircleDollarSign className="h-5 w-5" /> },
            { title: "Report Cards", href: `/director/dashboard/${schoolId}/parent/reports`, icon: <FileText className="h-5 w-5" /> },
            { title: "E-learning", href: `/director/dashboard/${schoolId}/parent/e-learning`, icon: <MonitorPlay className="h-5 w-5" /> },
            { title: "School Calendar", href: `/director/dashboard/${schoolId}/parent/calendar`, icon: <Calendar className="h-5 w-5" /> },
        ],
    },
    {
        section: "Librarian Menu",
        icon: <Library className="h-5 w-5" />,
        items: [
            { title: "Library Management", href: `/director/dashboard/${schoolId}/librarian/management`, icon: <BookMarked className="h-5 w-5" /> },
        ],
    },
];

type DirectorSidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  schoolId: string | null;
};

const NavLink = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
  const pathname = usePathname();
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary font-semibold",
              isCollapsed && "justify-center",
            )}
          >
            {item.icon}
            <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>{item.title}</span>
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
};

export function DirectorSidebar({ isCollapsed, toggleSidebar, schoolId }: DirectorSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Academics': true,
  });

  const navItems = useMemo(() => {
    return schoolId ? directorSidebarNavItems(schoolId) : [];
  }, [schoolId]);

  const toggleSection = (section: string) => {
    if (!isCollapsed) {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    }
  };

  const baseNavLinks = useMemo(() => {
    if (!schoolId) return [];
    return [
        { title: "Dashboard", href: `/director/dashboard/${schoolId}`, icon: <LayoutDashboard className="h-5 w-5" /> },
        { title: "Profile", href: `/director/dashboard/${schoolId}/profile`, icon: <UserCircle className="h-5 w-5" /> },
    ]
  }, [schoolId]);

  return (
    <div className={cn(
        "hidden md:flex flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}>
        <div className={cn("flex h-16 items-center border-b px-4")}>
          <Link href={`/director/dashboard/${schoolId}`} className="flex items-center gap-2 font-semibold">
            <School className="h-6 w-6 text-primary" />
            <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>Campus Hub</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <nav className="flex flex-col gap-1 px-2 py-4 text-sm font-medium">
                {baseNavLinks.map((item, index) => <NavLink key={index} item={item} isCollapsed={isCollapsed} />)}
                <div className="my-2 space-y-1">
                    {navItems.map((section, index) => (
                    <div key={index}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start items-center px-3 py-2 text-sm font-semibold text-muted-foreground",
                                isCollapsed ? 'justify-center' : 'justify-between'
                            )}
                            onClick={() => toggleSection(section.section)}
                            >
                            <div className="flex items-center gap-3">
                                {section.icon}
                                <span className={cn(isCollapsed && 'hidden')}>{section.section}</span>
                            </div>
                           {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openSections[section.section] ? 'rotate-180' : '')} />}
                        </Button>
                        
                        {!isCollapsed && openSections[section.section] && (
                            <div className="pl-6 flex flex-col gap-1 mt-1">
                                {section.items.map((item, itemIndex) => (
                                    item.href && <NavLink key={itemIndex} item={item} isCollapsed={isCollapsed}/>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                </div>
            </nav>
        </div>
        <div className="mt-auto border-t p-4">
            <div className={cn("flex items-center gap-3", isCollapsed && 'justify-center')}>
                <Avatar className="h-9 w-9">
                    <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className={cn("flex flex-col", isCollapsed && 'hidden')}>
                    <span className="text-sm font-medium">© 2025 Campus Hub</span>
                </div>
            </div>
        </div>
    </div>
  );
}
