
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
    BarChart2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/director/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "User Management",
    href: "/director/dashboard/principal",
    icon: <UserPlus className="h-5 w-5" />,
  },
  {
    title: "School Profile",
    href: "/director/dashboard/profile",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Academics",
    href: "/director/dashboard/academics",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "HR & Payroll",
    href: "/director/dashboard/hr",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Financials",
    href: "/director/dashboard/financials",
    icon: <Banknote className="h-5 w-5" />,
  },
    {
    title: "Administration",
    href: "/director/dashboard/admin",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Communication",
    href: "/director/dashboard/communication",
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    title: "Reports",
    href: "/director/dashboard/reports",
    icon: <BarChart2 className="h-5 w-5" />,
  },
];

export function DirectorSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <School className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold ml-2">WG Campus</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              pathname.startsWith(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {item.icon}
            <span className="ml-3">{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 space-y-4 border-t">
         <ThemeToggle />
         <Link
            href="/school/login"
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted"
            )}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </Link>
      </div>
    </div>
  );
}

