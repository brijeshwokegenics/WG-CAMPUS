
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart2, Building2, Banknote, Settings, Megaphone, BookOpen, UserPlus, Briefcase, Users, UserCheck, DollarSign, Calendar, Shield, FileText, Bus, Library, BedDouble, MessageSquare, GraduationCap, Wallet, Home, Gate, Info } from "lucide-react";

const kpiData = [
  { title: "Total Students", value: "1,250", icon: <Users className="h-6 w-6 text-muted-foreground" /> },
  { title: "Total Staff", value: "85", icon: <Briefcase className="h-6 w-6 text-muted-foreground" /> },
  { title: "Attendance Rate", value: "95.8%", icon: <UserCheck className="h-6 w-6 text-muted-foreground" /> },
  { title: "Fees Collected", value: "$75,430", icon: <DollarSign className="h-6 w-6 text-muted-foreground" /> },
];

export default function DirectorDashboard({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  const featureSections = [
    {
      title: "Academics",
      features: [
        { title: "Classes & Sections", description: "Manage academic classes and sections.", icon: <Building2 className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/classes` },
        { title: "Admissions", description: "Handle new student admission processes.", icon: <UserPlus className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/admissions` },
        { title: "Students", description: "View and manage all student records.", icon: <Users className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/students` },
        { title: "Promote Students", description: "Promote students to the next class.", icon: <GraduationCap className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/promote` },
        { title: "Attendance", description: "Monitor student and staff attendance.", icon: <UserCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/attendance` },
        { title: "Timetable", description: "Create and manage class schedules.", icon: <Calendar className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/timetable` },
        { title: "Exams", description: "Oversee exam schedules and results.", icon: <BarChart2 className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/exams` },
        { title: "Reports", description: "Generate academic reports.", icon: <FileText className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/reports` },
        { title: "E-learning", description: "Manage online learning resources.", icon: <BookOpen className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/elearning` },
      ]
    },
    {
      title: "HR",
      features: [
        { title: "Staff Directory", description: "Browse and manage staff profiles.", icon: <Users className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/hr/directory` },
        { title: "Staff Attendance", description: "Track attendance for all staff members.", icon: <UserCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/hr/attendance` },
        { title: "Payroll", description: "Manage staff payroll and salaries.", icon: <Banknote className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/hr/payroll` },
        { title: "Staff Salary", description: "Set and manage salary structures.", icon: <DollarSign className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/hr/salary` },
        { title: "User Management", description: "Create Principal accounts and manage roles.", icon: <UserPlus className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/principal`},
      ]
    },
    {
      title: "Administration",
      features: [
        { title: "Fees", description: "Track fee collections and invoices.", icon: <Wallet className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/fees` },
        { title: "Fee Structure", description: "Define fee structures for different classes.", icon: <FileText className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/fee-structure` },
        { title: "Inventory", description: "Manage school assets and inventory.", icon: <Briefcase className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/inventory` },
        { title: "Transport", description: "Oversee transportation routes and vehicles.", icon: <Bus className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/transport` },
        { title: "Library", description: "Manage library books and members.", icon: <Library className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/library` },
        { title: "Hostel", description: "Manage hostel facilities and residents.", icon: <BedDouble className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/hostel` },
        { title: "Gate Pass", description: "Manage entry and exit with gate passes.", icon: <Gate className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/admin/gate-pass` },
        { title: "School Info", description: "Update school profile and general settings.", icon: <Info className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/profile` },
      ]
    },
    {
      title: "Communication",
      features: [
        { title: "Notices", description: "Send out notices and announcements.", icon: <Megaphone className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/notices` },
        { title: "Calendar", description: "Manage the school's event calendar.", icon: <Calendar className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/calendar` },
        { title: "Messaging", description: "Communicate with staff and parents.", icon: <MessageSquare className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/messaging` },
      ]
    }
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
        <div className="space-y-8">
            {featureSections.map(section => (
                 <div key={section.title}>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">{section.title}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.features.map((feature) => (
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
            ))}
        </div>
    </div>
  );
}
