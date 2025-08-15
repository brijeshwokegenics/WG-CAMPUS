
"use client";

import Link from "next/link";
import { Menu, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
    title: string;
    href?: string;
    icon?: React.ReactNode;
    isSection?: boolean;
};

type MobileSidebarProps = {
  navItems: NavItem[];
};

export function MobileSidebar({ navItems }: MobileSidebarProps) {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                        <School className="h-6 w-6 text-primary" />
                        <span className="">WG Campus</span>
                    </Link>
                    {navItems.map((item, index) =>
                        item.isSection ? (
                             <h2 key={index} className="px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase mt-4 mb-1">
                                {item.title}
                            </h2>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href!}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === item.href && "bg-muted text-primary"
                                )}
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        )
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
