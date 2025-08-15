
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart2, Building2, Banknote, Settings, Megaphone, BookOpen, UserPlus, Briefcase, Users, UserCheck, DollarSign, Calendar, Shield, FileText, Bus, Library, BedDouble, MessageSquare } from "lucide-react";

const kpiData = [
  { title: "Total Students", value: "1,250", icon: <Users className="h-6 w-6 text-muted-foreground" /> },
  { title: "Total Staff", value: "85", icon: <Briefcase className="h-6 w-6 text-muted-foreground" /> },
  { title: "Attendance Rate", value: "95.8%", icon: <UserCheck className="h-6 w-6 text-muted-foreground" /> },
  { title: "Fees Collected", value: "$75,430", icon: <DollarSign className="h-6 w-6 text-muted-foreground" /> },
];

export default function DirectorDashboard({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  const featureCards = [
    { 
        title: "User Management", 
        description: "Create Principal accounts and manage all user roles.", 
        icon: <UserPlus className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/principal`
    },
    { 
        title: "School Profile", 
        description: "Update school info, logo, and academic year settings.", 
        icon: <Building2 className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/profile`
    },
    { 
        title: "Academic Management", 
        description: "Manage classes, subjects, student admissions, and records.", 
        icon: <BookOpen className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/academics`
    },
     { 
        title: "Attendance & Discipline", 
        description: "Monitor student and staff attendance and track incidents.", 
        icon: <UserCheck className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/attendance`
    },
    { 
        title: "Exams & Performance", 
        description: "Oversee exam schedules, results, and performance analytics.", 
        icon: <BarChart2 className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/exams`
    },
    { 
        title: "HR & Payroll", 
        description: "Oversee staff management, attendance, and payroll.", 
        icon: <Briefcase className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/hr`
    },
     { 
        title: "Financials & Fees", 
        description: "Track fee collections, invoices, and manage school finances.", 
        icon: <Banknote className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/financials`
    },
    { 
        title: "Communication", 
        description: "Send notices, manage events, and handle communications.", 
        icon: <Megaphone className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/communication`
    },
     { 
        title: "Administration", 
        description: "Manage transport, library, and other school facilities.", 
        icon: <Settings className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/admin`
    },
    { 
        title: "Reports & Analytics", 
        description: "View detailed reports on all school operations.", 
        icon: <FileText className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/reports`
    },
    { 
        title: "Security & Logs", 
        description: "Manage security settings and view activity audit logs.", 
        icon: <Shield className="h-8 w-8 text-primary"/>,
        href: `/director/dashboard/${schoolId}/security`
    },
  ];

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a complete overview of your school.</p>
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
