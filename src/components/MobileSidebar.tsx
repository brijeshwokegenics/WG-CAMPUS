
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, School, ChevronDown, GraduationCap, Briefcase, Building, MessageSquare, PersonStanding, BookUser, LayoutDashboard, Users, UserCog, Printer, ClipboardList, Calendar, FileText, Book, Wallet, Banknote, Warehouse, Bus, Library, Hotel, Ticket, Info, Webhook, UserCheck, FolderKanban, Presentation, BookCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";


const getRoleFromPath = (path: string) => {
    const pathSegments = path.split('/');
    // Check for top-level role directories first. This is more specific.
    if (pathSegments[1] === 'teacher') return 'teacher';
    if (pathSegments[1] === 'admin') return 'admin';
    
    // Fallback for roles nested under director's dashboard
    const roleSegment = pathSegments.length > 4 ? pathSegments[4] : 'director';

    switch(roleSegment) {
        case 'accountant': return 'accountant';
        case 'parent': return 'parent';
        case 'librarian': return 'librarian';
        case 'principal': return 'principal';
        case 'hr': return 'hr';
        default: return 'director';
    }
};

const getNavItems = (role: string, schoolId: string) => {
    const directorNavs = [
      {
        section: "Academics",
        icon: <GraduationCap className="h-5 w-5" />,
        items: [
          { title: "Classes & Sections", href: `/director/dashboard/${schoolId}/academics/classes` },
          { title: "Admissions", href: `/director/dashboard/${schoolId}/academics/admissions` },
          { title: "Students", href: `/director/dashboard/${schoolId}/academics/students` },
          { title: "Promote Students", href: `/director/dashboard/${schoolId}/academics/promote` },
          { title: "Print Center", href: `/director/dashboard/${schoolId}/academics/print` },
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
          { title: "HR Dashboard", href: `/director/dashboard/${schoolId}/hr/dashboard`},
          { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory` },
          { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/hr/attendance` },
          { title: "Staff Salary", href: `/director/dashboard/${schoolId}/hr/salary` },
          { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll` },
        ],
      },
      {
        section: "Administration",
        icon: <Building className="h-5 w-5" />,
        items: [
          { title: "Admin Dashboard", href: `/director/dashboard/${schoolId}/admin/dashboard`},
          { title: "User Management", href: `/director/dashboard/${schoolId}/admin/users` },
          { title: "Fee Structure", href: `/director/dashboard/${schoolId}/admin/fee-structure` },
          { title: "Fees Management", href: `/director/dashboard/${schoolId}/admin/fees` },
          { title: "Inventory", href: `/director/dashboard/${schoolId}/admin/inventory` },
          { title: "Transport", href: `/director/dashboard/${schoolId}/admin/transport` },
          { title: "Library", href: `/director/dashboard/${schoolId}/admin/library` },
          { title: "Hostel", href: `/director/dashboard/${schoolId}/admin/hostel` },
          { title: "Gate Pass", href: `/director/dashboard/${schoolId}/admin/gate-pass` },
          { title: "School Info", href: `/director/dashboard/${schoolId}/admin/info` },
          { title: "Integrations", href: `/director/dashboard/${schoolId}/admin/integrations` },
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
    ];

    switch(role) {
        case 'admin':
            return [
                 {
                    section: "Administration",
                    icon: <Building className="h-5 w-5" />,
                    items: [
                      { title: "User Management", href: `/admin/${schoolId}/users` },
                    ],
                 }
            ];
        case 'hr':
            return [
                {
                    section: "HR",
                    icon: <Briefcase className="h-5 w-5" />,
                    items: [
                      { title: "Staff Directory", href: `/director/dashboard/${schoolId}/hr/directory` },
                      { title: "Staff Attendance", href: `/director/dashboard/${schoolId}/hr/attendance` },
                      { title: "Staff Salary", href: `/director/dashboard/${schoolId}/hr/salary` },
                      { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll` },
                    ],
                }
            ];
        case 'teacher':
            return [
                {
                    section: "Academics",
                    icon: <GraduationCap className="h-5 w-5" />,
                    items: [
                        { title: "Classes & Sections", href: `/teacher/${schoolId}/academics/classes` },
                        { title: "Attendance", href: `/teacher/${schoolId}/academics/attendance` },
                        { title: "Timetable", href: `/teacher/${schoolId}/academics/timetable` },
                        { title: "Exams", href: `/teacher/${schoolId}/academics/exams` },
                        { title: "Reports", href: `/teacher/${schoolId}/academics/reports` },
                        { title: "E-learning", href: `/teacher/${schoolId}/academics/elearning` },
                    ]
                },
                {
                    section: "Communication",
                    icon: <MessageSquare className="h-5 w-5" />,
                    items: [
                        { title: "Notices", href: `/teacher/${schoolId}/communication/notices` },
                        { title: "Calendar", href: `/teacher/${schoolId}/communication/calendar` },
                        { title: "Messaging", href: `/teacher/${schoolId}/communication/messaging` },
                    ]
                }
            ];
        case 'principal':
            return [
                 {
                    section: "Administration",
                    icon: <Building className="h-5 w-5" />,
                    items: [
                        { title: "User Management", href: `/director/dashboard/${schoolId}/admin/users` },
                    ]
                },
                {
                    section: "Academics",
                    icon: <GraduationCap className="h-5 w-5" />,
                    items: [
                        { title: "Classes", href: `/director/dashboard/${schoolId}/academics/classes` },
                        { title: "Students", href: `/director/dashboard/${schoolId}/academics/students` },
                        { title: "Reports", href: `/director/dashboard/${schoolId}/academics/reports` },
                    ]
                }
            ];
        case 'accountant':
             return [
                {
                    section: "Finance",
                    icon: <Wallet className="h-5 w-5" />,
                    items: [
                        { title: "Fee Collection", href: `/director/dashboard/${schoolId}/admin/fees` },
                        { title: "Fee Structure", href: `/director/dashboard/${schoolId}/admin/fee-structure` },
                        { title: "Payroll", href: `/director/dashboard/${schoolId}/hr/payroll` },
                    ]
                }
            ];
        case 'parent':
            return [
                {
                    section: "My Child",
                    icon: <Users className="h-5 w-5" />,
                    items: [
                        { title: "Profile", href: `/director/dashboard/${schoolId}/parent/profile` },
                        { title: "Attendance", href: `/director/dashboard/${schoolId}/parent/attendance` },
                        { title: "Fees", href: `/director/dashboard/${schoolId}/parent/fees` },
                        { title: "Report Cards", href: `/director/dashboard/${schoolId}/parent/reports` },
                        { title: "E-learning", href: `/director/dashboard/${schoolId}/parent/elearning` },
                        { title: "School Calendar", href: `/director/dashboard/${schoolId}/parent/calendar` },
                    ]
                }
            ];
        case 'librarian':
             return [
                {
                    section: "Library",
                    icon: <Library className="h-5 w-5" />,
                    items: [
                         { title: "Issue / Return", href: `/director/dashboard/${schoolId}/admin/library` },
                         { title: "Book Catalog", href: `/director/dashboard/${schoolId}/admin/library` },
                    ]
                }
            ];
        default: // director
            return directorNavs;
    }
}


type MobileSidebarProps = {
  schoolId?: string;
  navItems?: { title: string; href: string; icon: React.ReactNode }[];
};

export function MobileSidebar({ schoolId, navItems: superAdminNavItems }: MobileSidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const role = schoolId ? getRoleFromPath(pathname) : 'super-admin';
    
    const navItemsForRole = useMemo(() => {
        if (!schoolId) return [];
        return getNavItems(role, schoolId);
    }, [schoolId, role]);

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const dashboardLink = useMemo(() => {
        if (role === 'super-admin') return '/super-admin/dashboard';
        if (role === 'director') return `/director/dashboard/${schoolId}`;
        if (role === 'teacher') return `/teacher/${schoolId}/dashboard`;
        if (role === 'admin') return `/admin/${schoolId}/dashboard`;
        return `/director/dashboard/${schoolId}/${role}/dashboard`;
    }, [role, schoolId]);

    const baseNavLinks = [
        { title: 'Dashboard', href: dashboardLink, icon: <LayoutDashboard className="h-5 w-5" /> },
    ];
    
    const mainNavItems = schoolId ? navItemsForRole : superAdminNavItems || [];
    const isDirectorOrSuperAdmin = !!schoolId;

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
                         {isDirectorOrSuperAdmin ? mainNavItems.map((section: any, index) => (
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
                                        {section.items.map((item: any, itemIndex: number) =>
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
                        )) : mainNavItems.map((item: any) => (
                             !item.isSection && (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                        pathname.startsWith(item.href) && "bg-muted text-primary"
                                    )}
                                >
                                    {item.icon}
                                    {item.title}
                                </Link>
                             )
                        ))
                        }
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    );
}
