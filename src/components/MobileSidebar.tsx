
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, School, ChevronDown, GraduationCap, Briefcase, Building, MessageSquare, PersonStanding, BookUser, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const directorSidebarNavItems = (schoolId: string) => [
  {
    section: "Academics",
    icon: <GraduationCap className="h-5 w-5" />,
    items: [
      { title: "Classes & Sections", href: `/director/dashboard/${schoolId}/academics/classes` },
      { title: "Admissions", href: `/director/dashboard/${schoolId}/academics/admissions` },
      { title: "Students", href: `/director/dashboard/${schoolId}/academics/students` },
      { title: "Promote Students", href: `/director/dashboard/${schoolId}/academics/promote` },
      { title: "Attendance", href: `/director/dashboard/${schoolId}/academics/attendance` },
      { title: "Timetable", href: `/director/dashboard/${schoolId}/academics/timetable` },
      { title: "Exams", href: `/director/dashboard/${schoolId}/academics/exams` },
      { title: "Reports", href: `/director/dashboard/${schoolId}/academics/reports` },
      { title: "E-learning", href: `/director/dashboard/${schoolId}/academics/elearning` },
    ],
  },
  {
    section: "HR",
    icon: <Briefcase className="h-5 w-5" />,
    items: [
      { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory` },
      { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/hr/attendance` },
      { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll` },
      { title: "Staff Salary", href: `/director/dashboard/${schoolId}/hr/salary` },
    ],
  },
  {
    section: "Administration",
    icon: <Building className="h-5 w-5" />,
    items: [
      { title: "User Management", href: `/director/dashboard/${schoolId}/admin/users` },
      { title: "Fees", href: `/director/dashboard/${schoolId}/admin/fees` },
      { title: "Fee Structure", href: `/director/dashboard/${schoolId}/admin/fee-structure` },
      { title: "Inventory", href: `/director/dashboard/${schoolId}/admin/inventory` },
      { title: "Transport", href: `/director/dashboard/${schoolId}/admin/transport` },
      { title: "Library", href: `/director/dashboard/${schoolId}/admin/library` },
      { title: "Hostel", href: `/director/dashboard/${schoolId}/admin/hostel` },
      { title: "Gate Pass", href: `/director/dashboard/${schoolId}/admin/gate-pass` },
      { title: "School Info", href: `/director/dashboard/${schoolId}/admin/info` },
    ],
  },
  {
    section: "Communication",
    icon: <MessageSquare className="h-5 w-5" />,
    items: [
      { title: "Notices", href: `/director/dashboard/${schoolId}/communication/notices` },
      { title: "Calendar", href: `/director/dashboard/${schoolId}/communication/calendar` },
      { title: "Messaging", href: `/director/dashboard/${schoolId}/communication/messaging` },
    ],
  },
  {
    section: "Accountant Menu",
    icon: <PersonStanding className="h-5 w-5" />,
    items: [
      { title: "Fees Management", href: `/director/dashboard/${schoolId}/accountant/fees` },
      { title: "Fee Structure", href: `/director/dashboard/${schoolId}/accountant/fee-structure` },
      { title: "Payroll Processing", href: `/director/dashboard/${schoolId}/accountant/payroll` },
    ],
  },
  {
    section: "Parent Menu",
    icon: <Users className="h-5 w-5" />,
    items: [
      { title: "Dashboard", href: `/director/dashboard/${schoolId}/parent/dashboard` },
      { title: "Child's Profile", href: `/director/dashboard/${schoolId}/parent/profile` },
      { title: "Attendance", href: `/director/dashboard/${schoolId}/parent/attendance` },
      { title: "Fees", href: `/director/dashboard/${schoolId}/parent/fees` },
      { title: "Report Cards", href: `/director/dashboard/${schoolId}/parent/reports` },
      { title: "E-learning", href: `/director/dashboard/${schoolId}/parent/elearning` },
      { title: "School Calendar", href: `/director/dashboard/${schoolId}/parent/calendar` },
    ],
  },
  {
    section: "Librarian Menu",
    icon: <BookUser className="h-5 w-5" />,
    items: [
      { title: "Library Management", href: `/director/dashboard/${schoolId}/librarian/management` },
    ],
  },
];


type MobileSidebarProps = {
  schoolId?: string;
};

export function MobileSidebar({ schoolId }: MobileSidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const navItems = useMemo(() => (schoolId ? directorSidebarNavItems(schoolId) : []), [schoolId]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const baseNavLinks = [
        { title: 'Dashboard', href: schoolId ? `/director/dashboard/${schoolId}` : '/super-admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    ];
    
    // Determine which set of nav items to use
    const mainNavItems = schoolId ? navItems : [];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="flex-grow overflow-y-auto">
                    <Link
                        href="#"
                        className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                        <School className="h-6 w-6 text-primary" />
                        <span className="">WG Campus</span>
                    </Link>
                    
                    <div className="my-2 flex flex-col gap-1">
                        {baseNavLinks.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname === item.href && "bg-muted text-primary"
                                )}
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        ))}
                         {mainNavItems.map((section, index) => (
                            <div key={index} className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between items-center px-3 py-2 font-semibold text-foreground hover:bg-muted"
                                    onClick={() => toggleSection(section.section)}
                                    >
                                    <div className="flex items-center gap-3">
                                        {section.icon}
                                        <span>{section.section}</span>
                                    </div>
                                    <ChevronDown className={cn("h-5 w-5 transition-transform", openSections[section.section] ? 'rotate-180' : '')} />
                                </Button>
                                {openSections[section.section] && (
                                    <div className="pl-8 space-y-1 border-l-2 border-muted ml-4">
                                        {section.items.map((item, itemIndex) =>
                                            item.href && (
                                                <Link
                                                    key={itemIndex}
                                                    href={item.href}
                                                    onClick={() => setOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm",
                                                        pathname === item.href && "bg-muted text-primary"
                                                    )}
                                                >
                                                    {item.title}
                                                </Link>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
