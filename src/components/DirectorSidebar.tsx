
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
    Settings, 
    Megaphone, 
    BarChart2,
    UserCheck,
    FileText,
    Shield,
    PanelLeftClose,
    PanelRightClose
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";


export const directorSidebarNavItems = (schoolId: string) => [
    {
      title: "Dashboard",
      href: `/director/dashboard/${schoolId}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      isSection: true,
      title: "Management"
    },
    {
      title: "User Management",
      href: `/director/dashboard/${schoolId}/principal`,
      icon: <UserPlus className="h-5 w-5" />,
    },
    {
      title: "School Profile",
      href: `/director/dashboard/${schoolId}/profile`,
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "HR & Payroll",
      href: `/director/dashboard/${schoolId}/hr`,
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      title: "Financials",
      href: `/director/dashboard/${schoolId}/financials`,
      icon: <Banknote className="h-5 w-5" />,
    },
      {
      title: "Administration",
      href: `/director/dashboard/${schoolId}/admin`,
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: "Communication",
      href: `/director/dashboard/${schoolId}/communication`,
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      isSection: true,
      title: "Academics"
    },
    {
      title: "Academics",
      href: `/director/dashboard/${schoolId}/academics`,
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
        title: "Attendance",
        href: `/director/dashboard/${schoolId}/attendance`,
        icon: <UserCheck className="h-5 w-5" />,
    },
    {
        title: "Exams",
        href: `/director/dashboard/${schoolId}/exams`,
        icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      isSection: true,
      title: "Analytics & Security"
    },
    {
      title: "Reports",
      href: `/director/dashboard/${schoolId}/reports`,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Security",
      href: `/director/dashboard/${schoolId}/security`,
      icon: <Shield className="h-5 w-5" />,
    },
];

type DirectorSidebarProps = {
  schoolId: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export function DirectorSidebar({ schoolId, isCollapsed, toggleSidebar }: DirectorSidebarProps) {
  const pathname = usePathname();
  const navItems = directorSidebarNavItems(schoolId);

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
         <Link href={`/director/dashboard/${schoolId}`} className="flex items-center gap-2 font-semibold">
          <School className="h-6 w-6 text-primary" />
          <span className={cn("origin-left duration-200", isCollapsed && "hidden")}>WG Campus</span>
        </Link>
         <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleSidebar}>
          {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) =>
          item.isSection ? (
            <h2 key={index} className={cn("mb-2 mt-2 px-3 text-lg font-semibold tracking-tight", isCollapsed && "hidden")}>
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
