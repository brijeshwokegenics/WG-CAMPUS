
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { School, LayoutDashboard, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  // Removed "Create School" from here to make it a primary action from the dashboard
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 bg-card border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <School className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold ml-2">WG Campus</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {item.icon}
            <span className="ml-3">{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
