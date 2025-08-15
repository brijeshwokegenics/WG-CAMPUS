
"use client";

import Link from "next/link";
import { Menu, School, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

type NavItem = {
    title: string;
    href?: string;
    icon?: React.ReactNode;
};

type NavSection = {
    section: string;
    icon?: React.ReactNode;
    items: NavItem[];
};

type MobileSidebarProps = {
  navItems: NavSection[];
};

export function MobileSidebar({ navItems }: MobileSidebarProps) {
    const pathname = usePathname();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium overflow-y-auto">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                        <School className="h-6 w-6 text-primary" />
                        <span className="">WG Campus</span>
                    </Link>
                    {navItems.map((section, index) => (
                        <div key={index} className="space-y-1">
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
                            {openSections[section.section] && (
                                <div className="pl-8 space-y-1">
                                    {section.items.map((item, itemIndex) =>
                                        item.href && (
                                            <Link
                                                key={itemIndex}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                                                    pathname === item.href && "bg-muted text-primary"
                                                )}
                                            >
                                                {item.icon}
                                                {item.title}
                                            </Link>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

    