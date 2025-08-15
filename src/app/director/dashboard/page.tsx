
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart2, Building2, DollarSign, FileText, Megaphone, Settings, Shield, UserPlus, Users, Bus, Library, BedDouble, BookOpen, UserCheck, Briefcase, Calendar, MessageSquare, Banknote } from "lucide-react";

const kpiData = [
  { title: "Total Students", value: "1,250", icon: <Users className="h-6 w-6 text-muted-foreground" /> },
  { title: "Total Staff", value: "85", icon: <Briefcase className="h-6 w-6 text-muted-foreground" /> },
  { title: "Attendance Rate", value: "95.8%", icon: <UserCheck className="h-6 w-6 text-muted-foreground" /> },
  { title: "Revenue This Month", value: "$75,430", icon: <DollarSign className="h-6 w-6 text-muted-foreground" /> },
];

const featureCards = [
    { 
        title: "User Management", 
        description: "Create and manage the Principal account for the school.", 
        icon: <UserPlus className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/principal"
    },
    { 
        title: "School Profile", 
        description: "Update school information, logo, and contact details.", 
        icon: <Building2 className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/profile"
    },
    { 
        title: "Academic Management", 
        description: "Manage classes, subjects, student admissions, and records.", 
        icon: <BookOpen className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/academics"
    },
    { 
        title: "HR & Payroll", 
        description: "Oversee staff management, attendance, and payroll processes.", 
        icon: <Briefcase className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/hr"
    },
     { 
        title: "Financials", 
        description: "Track fees, create invoices, and manage school finances.", 
        icon: <Banknote className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/financials"
    },
    { 
        title: "Administration", 
        description: "Manage inventory, transport, library, and hostel facilities.", 
        icon: <Settings className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/admin"
    },
    { 
        title: "Communication", 
        description: "Post notices, manage events, and send messages.", 
        icon: <Megaphone className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/communication"
    },
    { 
        title: "Analytics & Reports", 
        description: "View detailed reports on all school operations.", 
        icon: <BarChart2 className="h-8 w-8 text-primary"/>,
        href: "/director/dashboard/reports"
    },
];

export default function DirectorDashboard() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your school.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        {kpi.icon}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                    </CardContent>
                </Card>
            ))}
        </div>
        
        {/* Feature Grid */}
        <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Management Modules</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featureCards.map((feature) => (
                    <Card key={feature.title} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                {feature.icon}
                                <CardTitle>{feature.title}</CardTitle>
                            </div>
                            <CardDescription className="pt-2">{feature.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                             <Link href={feature.href} passHref>
                                <Button className="w-full">
                                    Manage <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
