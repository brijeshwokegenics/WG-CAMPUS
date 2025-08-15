
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    FileBadge,
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
    MessageCircle,
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
    ShieldCheck,
    UserCheck
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
      title: "School & General Settings"
    },
    { title: "School Profile", href: `/director/dashboard/${schoolId}/profile`, icon: <Building className="h-5 w-5" /> },
    { title: "Academic Year Setup", href: `/director/dashboard/${schoolId}/settings/academic-year`, icon: <CalendarClock className="h-5 w-5" /> },
    { title: "Subscription Details", href: `/director/dashboard/${schoolId}/settings/subscription`, icon: <FileBadge className="h-5 w-5" /> },

    {
      isSection: true,
      title: "User Management"
    },
    { title: "Manage Principal", href: `/director/dashboard/${schoolId}/principal`, icon: <Users2 className="h-5 w-5" />},
    { title: "View All Users", href: `/director/dashboard/${schoolId}/users`, icon: <Users className="h-5 w-5" /> },
    { title: "User Activity Logs", href: `/director/dashboard/${schoolId}/users/logs`, icon: <History className="h-5 w-5" /> },

    {
      isSection: true,
      title: "Staff Management"
    },
    { title: "Teacher & Staff Profiles", href: `/director/dashboard/${schoolId}/staff`, icon: <Briefcase className="h-5 w-5" /> },
    { title: "Leave Request Approval", href: `/director/dashboard/${schoolId}/staff/leave`, icon: <ClipboardCheck className="h-5 w-5" /> },
    
    {
      isSection: true,
      title: "Academic Oversight"
    },
    { title: "Class & Section Overview", href: `/director/dashboard/${schoolId}/academics/classes`, icon: <BookMarked className="h-5 w-5" /> },
    { title: "Subject Allocation", href: `/director/dashboard/${schoolId}/academics/subjects`, icon: <BookCopy className="h-5 w-5" /> },
    { title: "Academic Calendar", href: `/director/dashboard/${schoolId}/academics/calendar`, icon: <CalendarCheck className="h-5 w-5" /> },
    { title: "Lesson Plan Progress", href: `/director/dashboard/${schoolId}/academics/lesson-plans`, icon: <GanttChartSquare className="h-5 w-5" /> },

    {
      isSection: true,
      title: "Attendance & Discipline"
    },
    { title: "Student Attendance", href: `/director/dashboard/${schoolId}/attendance/student`, icon: <UserCheck className="h-5 w-5" /> },
    { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/attendance/staff`, icon: <ClipboardCheck className="h-5 w-5" /> },
    { title: "Disciplinary Reports", href: `/director/dashboard/${schoolId}/discipline`, icon: <ShieldAlert className="h-5 w-5" /> },

    {
      isSection: true,
      title: "Examinations & Performance"
    },
    { title: "Exam Schedule", href: `/director/dashboard/${schoolId}/exams/schedule`, icon: <CalendarClock className="h-5 w-5" /> },
    { title: "Result Analysis", href: `/director/dashboard/${schoolId}/exams/results`, icon: <PieChart className="h-5 w-5" /> },
    { title: "Performance Trends", href: `/director/dashboard/${schoolId}/exams/trends`, icon: <AreaChart className="h-5 w-5" /> },
    
    {
      isSection: true,
      title: "Financial & Fee Monitoring"
    },
    { title: "Fee Collection", href: `/director/dashboard/${schoolId}/finance/fees`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Scholarships", href: `/director/dashboard/${schoolId}/finance/scholarships`, icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Outstanding Fees", href: `/director/dashboard/${schoolId}/finance/outstanding`, icon: <ListFilter className="h-5 w-5" /> },
    { title: "Expense Overview", href: `/director/dashboard/${schoolId}/finance/expenses`, icon: <Receipt className="h-5 w-5" /> },

    {
      isSection: true,
      title: "Communication & Notifications"
    },
    { title: "Send Announcements", href: `/director/dashboard/${schoolId}/communication/announce`, icon: <Megaphone className="h-5 w-5" /> },
    { title: "Communications Log", href: `/director/dashboard/${schoolId}/communication/log`, icon: <Mail className="h-5 w-5" /> },
    { title: "Parent Meetings", href: `/director/dashboard/${schoolId}/communication/meetings`, icon: <MessageCircle className="h-5 w-5" /> },
    { title: "Emergency Alerts", href: `/director/dashboard/${schoolId}/communication/emergency`, icon: <BellDot className="h-5 w-5" /> },
    
    {
      isSection: true,
      title: "Events & Activities"
    },
    { title: "Event Calendar", href: `/director/dashboard/${schoolId}/events`, icon: <CalendarCheck className="h-5 w-5" /> },
    { title: "Student Participation", href: `/director/dashboard/${schoolId}/events/participation`, icon: <Presentation className="h-5 w-5" /> },

    {
        isSection: true,
        title: "Reports & Analytics"
    },
    { title: "Enrollment Reports", href: `/director/dashboard/${schoolId}/reports/enrollment`, icon: <FileText className="h-5 w-5" /> },
    { title: "Performance Reports", href: `/director/dashboard/${schoolId}/reports/performance`, icon: <BarChart2 className="h-5 w-5" /> },
    { title: "Financial Reports", href: `/director/dashboard/${schoolId}/reports/financial`, icon: <LineChart className="h-5 w-5" /> },
    { title: "Custom Report Builder", href: `/director/dashboard/${schoolId}/reports/custom`, icon: <FileCog className="h-5 w-5" /> },

    {
        isSection: true,
        title: "Transport & Safety"
    },
    { title: "Transport Overview", href: `/director/dashboard/${schoolId}/transport`, icon: <Bus className="h-5 w-5" /> },
    { title: "GPS Tracking", href: `/director/dashboard/${schoolId}/transport/tracking`, icon: <Map className="h-5 w-5" /> },
    { title: "Safety Incidents", href: `/director/dashboard/${schoolId}/transport/safety`, icon: <ShieldAlert className="h-5 w-5" /> },

    {
        isSection: true,
        title: "Document & Certificate Approval"
    },
    { title: "Approve Certificates", href: `/director/dashboard/${schoolId}/documents/approve`, icon: <CheckCircle className="h-5 w-5" /> },

    {
        isSection: true,
        title: "Security & Compliance"
    },
    { title: "Two-Factor Auth", href: `/director/dashboard/${schoolId}/security/2fa`, icon: <KeyRound className="h-5 w-5" /> },
    { title: "Audit Logs", href: `/director/dashboard/${schoolId}/security/audit`, icon: <History className="h-5 w-5" /> },
    { title: "Data Privacy", href: `/director/dashboard/${schoolId}/security/privacy`, icon: <ShieldCheck className="h-5 w-5" /> },
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
        {navItems.map((item, index) =>
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
