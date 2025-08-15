
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    School, 
    LayoutDashboard, 
    LogOut, 
    UserPlus, 
    Building2, 
    BookOpen, 
    Briefcase, 
    Banknote, 
    Megaphone, 
    BarChart2,
    UserCheck,
    FileText,
    PanelLeftClose,
    PanelRightClose,
    Users,
    Calendar,
    DollarSign,
    GraduationCap,
    Bus,
    Library,
    BedDouble,
    MessageSquare,
    Wallet,
    HomeIcon,
    DoorOpen,
    Info,
    BookMark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useSchool } from "@/context/SchoolProvider";


export const directorSidebarNavItems = (schoolId: string) => [
    {
      title: "Dashboard",
      href: `/director/dashboard/${schoolId}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      isSection: true,
      title: "Academics"
    },
    { title: "Classes & Sections", href: `/director/dashboard/${schoolId}/academics/classes`, icon: <Building2 className="h-5 w-5" /> },
    { title: "Admissions", href: `/director/dashboard/${schoolId}/academics/admissions`, icon: <UserPlus className="h-5 w-5" /> },
    { title: "Students", href: `/director/dashboard/${schoolId}/academics/students`, icon: <Users className="h-5 w-5" /> },
    { title: "Promote Students", href: `/director/dashboard/${schoolId}/academics/promote`, icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Attendance", href: `/director/dashboard/${schoolId}/academics/attendance`, icon: <UserCheck className="h-5 w-5" /> },
    { title: "Timetable", href: `/director/dashboard/${schoolId}/academics/timetable`, icon: <Calendar className="h-5 w-5" /> },
    { title: "Exams", href: `/director/dashboard/${schoolId}/academics/exams`, icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Reports", href: `/director/dashboard/${schoolId}/academics/reports`, icon: <FileText className="h-5 w-5" /> },
    { title: "E-learning", href: `/director/dashboard/${schoolId}/academics/elearning`, icon: <BookOpen className="h-5 w-5" /> },

    {
      isSection: true,
      title: "HR"
    },
    { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory`, icon: <Users className="h-5 w-5" /> },
    { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/hr/attendance`, icon: <UserCheck className="h-5 w-5" /> },
    { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll`, icon: <Banknote className="h-5 w-5" /> },
    { title: "Staff Salary", href: `/director/dashboard/${schoolId}/hr/salary`, icon: <DollarSign className="h-5 w-5" /> },
    { title: "User Management", href: `/director/dashboard/${schoolId}/principal`, icon: <UserPlus className="h-5 w-5" />},
    
    {
      isSection: true,
      title: "Administration"
    },
    { title: "Fees", href: `/director/dashboard/${schoolId}/admin/fees`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Fee Structure", href: `/director/dashboard/${schoolId}/admin/fee-structure`, icon: <FileText className="h-5 w-5" /> },
    { title: "Inventory", href: `/director/dashboard/${schoolId}/admin/inventory`, icon: <Briefcase className="h-5 w-5" /> },
    { title: "Transport", href: `/director/dashboard/${schoolId}/admin/transport`, icon: <Bus className="h-5 w-5" /> },
    { title: "Library", href: `/director/dashboard/${schoolId}/admin/library`, icon: <Library className="h-5 w-5" /> },
    { title: "Hostel", href: `/director/dashboard/${schoolId}/admin/hostel`, icon: <BedDouble className="h-5 w-5" /> },
    { title: "Gate Pass", href: `/director/dashboard/${schoolId}/admin/gate-pass`, icon: <DoorOpen className="h-5 w-5" /> },
    { title: "School Info", href: `/director/dashboard/${schoolId}/profile`, icon: <Info className="h-5 w-5" /> },
    
    {
      isSection: true,
      title: "Communication"
    },
    { title: "Notices", href: `/director/dashboard/${schoolId}/communication/notices`, icon: <Megaphone className="h-5 w-5" /> },
    { title: "Calendar", href: `/director/dashboard/${schoolId}/communication/calendar`, icon: <Calendar className="h-5 w-5" /> },
    { title: "Messaging", href: `/director/dashboard/${schoolId}/communication/messaging`, icon: <MessageSquare className="h-5 w-5" /> },
];

type DirectorSidebarProps = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function DirectorSidebar({ isCollapsed, toggleSidebar }: DirectorSidebarProps) {
  const pathname = usePathname();
  const { schoolId } = useSchool();
  
  const navItems = schoolId ? directorSidebarNavItems(schoolId) : [];

  const NavLink = ({ item }: { item: any }) => (
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
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {schoolId && navItems.map((item, index) =>
          item.isSection ? (
            <h2 key={index} className={cn("px-3 text-sm font-semibold tracking-tight text-muted-foreground", isCollapsed ? 'hidden' : 'mb-1 mt-2')}>
                {item.title}
            </h2>
          ) : (
            <NavLink key={item.href} item={item} />
          )
        )}
      </nav>
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
