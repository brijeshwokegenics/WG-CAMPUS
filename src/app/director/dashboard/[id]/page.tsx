
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    ArrowRight,
    Building,
    Users,
    Briefcase,
    GraduationCap,
    UserCheck,
    BarChart2,
    Wallet,
    Megaphone,
    CalendarCheck,
    FileText,
    Bus,
    FileBadge,
    Smartphone,
    ShieldCheck,
    Users2,
    BookCopy,
    BookMarked,
    AreaChart,
    PieChart,
    BellDot,
    CalendarClock,
    GanttChartSquare,
    ClipboardCheck,
    CircleDollarSign,
    Receipt,
    ListFilter,
    MessageCircle,
    Mail,
    Presentation,
    LineChart,
    FileCog,
    Map,
    ShieldAlert,
    CheckCircle,
    SmartphoneNfc,
    KeyRound,
    History
} from "lucide-react";


export default function DirectorDashboard({ params }: { params: { id: string } }) {
  const schoolId = params.id;

    const kpiData = [
        { title: "Total Students", value: "1,250", icon: <Users className="h-6 w-6 text-muted-foreground" /> },
        { title: "Total Staff", value: "85", icon: <Briefcase className="h-6 w-6 text-muted-foreground" /> },
        { title: "Attendance Rate", value: "95.8%", icon: <UserCheck className="h-6 w-6 text-muted-foreground" /> },
        { title: "Fees Collected", value: "$75,430", icon: <CircleDollarSign className="h-6 w-6 text-muted-foreground" /> },
    ];

  const featureSections = [
    {
      title: "School Profile & General Settings",
      features: [
        { title: "School Profile", description: "Name, logo, address, contact info.", icon: <Building className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/profile` },
        { title: "Academic Year Setup", description: "Manage academic sessions and dates.", icon: <CalendarClock className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/settings/academic-year` },
        { title: "Subscription Details", description: "View plan type and expiry date.", icon: <FileBadge className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/settings/subscription` },
      ]
    },
    {
      title: "User Management",
      features: [
        { title: "Manage Principal", description: "Create/manage Principal credentials.", icon: <Users2 className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/principal` },
        { title: "View All Users", description: "Browse all users in the school.", icon: <Users className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/users` },
        { title: "User Activity Logs", description: "Track role-wise counts & logs.", icon: <History className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/users/logs` },
      ]
    },
    {
      title: "Staff Management",
      features: [
        { title: "Teacher & Staff Profiles", description: "View staff details and performance.", icon: <Briefcase className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/staff` },
        { title: "Leave Request Approval", description: "Approve or deny staff leave.", icon: <ClipboardCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/staff/leave` },
      ]
    },
    {
      title: "Academic Oversight",
      features: [
        { title: "Class & Section Overview", description: "View all classes and sections.", icon: <BookMarked className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/classes` },
        { title: "Subject Allocation", description: "Manage subject assignments.", icon: <BookCopy className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/subjects` },
        { title: "Academic Calendar", description: "Approve school events and holidays.", icon: <CalendarCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/calendar` },
        { title: "Lesson Plan Progress", description: "Track syllabus completion status.", icon: <GanttChartSquare className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/academics/lesson-plans` },
      ]
    },
    {
      title: "Attendance & Discipline",
      features: [
        { title: "Student Attendance", description: "Monitor student attendance summaries.", icon: <UserCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/attendance/student` },
        { title: "Staff Attendance", description: "Monitor staff attendance summaries.", icon: <ClipboardCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/attendance/staff` },
        { title: "Disciplinary Reports", description: "Track and view incident reports.", icon: <ShieldAlert className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/discipline` },
      ]
    },
     {
      title: "Examinations & Performance",
      features: [
        { title: "Exam Schedule", description: "View and approve exam schedules.", icon: <CalendarClock className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/exams/schedule` },
        { title: "Result Analysis", description: "Analyze results, pass %, and toppers.", icon: <PieChart className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/exams/results` },
        { title: "Performance Trends", description: "View year-on-year academic trends.", icon: <AreaChart className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/exams/trends` },
      ]
    },
    {
      title: "Financial & Fee Monitoring",
      features: [
        { title: "Fee Collection", description: "Track collected, pending, overdue fees.", icon: <Wallet className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/finance/fees` },
        { title: "Scholarships", description: "Manage scholarships and concessions.", icon: <GraduationCap className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/finance/scholarships` },
        { title: "Outstanding Fees", description: "View lists of students with due fees.", icon: <ListFilter className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/finance/outstanding` },
        { title: "Expense Overview", description: "Monitor payroll, utilities, and costs.", icon: <Receipt className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/finance/expenses` },
      ]
    },
    {
      title: "Communication & Notifications",
      features: [
        { title: "Send Announcements", description: "Broadcast messages to users.", icon: <Megaphone className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/announce` },
        { title: "Communications Log", description: "View sent and received messages.", icon: <Mail className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/log` },
        { title: "Parent Meetings", description: "Oversee parent-teacher meetings.", icon: <MessageCircle className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/meetings` },
        { title: "Emergency Alerts", description: "Send urgent notifications.", icon: <BellDot className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/communication/emergency` },
      ]
    },
    {
      title: "Events & Activities",
      features: [
        { title: "Event Calendar", description: "View and approve upcoming events.", icon: <CalendarCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/events` },
        { title: "Student Participation", description: "Track student involvement in events.", icon: <Presentation className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/events/participation` },
      ]
    },
    {
      title: "Reports & Analytics",
      features: [
        { title: "Enrollment Reports", description: "View admission and withdrawal data.", icon: <FileText className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/reports/enrollment` },
        { title: "Performance Reports", description: "Generate academic performance reports.", icon: <BarChart2 className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/reports/performance` },
        { title: "Financial Reports", description: "Generate fee and finance reports.", icon: <LineChart className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/reports/financial` },
        { title: "Custom Report Builder", description: "Create and save custom reports.", icon: <FileCog className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/reports/custom` },
      ]
    },
    {
      title: "Transport & Safety",
      features: [
        { title: "Transport Overview", description: "Manage routes, vehicles, driver details.", icon: <Bus className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/transport` },
        { title: "GPS Tracking", description: "View real-time location of buses.", icon: <Map className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/transport/tracking` },
        { title: "Safety Incidents", description: "Report and track safety incidents.", icon: <ShieldAlert className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/transport/safety` },
      ]
    },
    {
      title: "Document & Certificate Approval",
      features: [
        { title: "Approve Certificates", description: "Approve TCs and other certificates.", icon: <CheckCircle className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/documents/approve` },
      ]
    },
     {
      title: "Security & Compliance",
      features: [
        { title: "Two-Factor Auth", description: "Enable/disable 2FA for your account.", icon: <KeyRound className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/security/2fa` },
        { title: "Audit Logs", description: "Track all actions performed in the ERP.", icon: <History className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/security/audit` },
        { title: "Data Privacy", description: "Manage data access restrictions.", icon: <ShieldCheck className="h-8 w-8 text-primary"/>, href: `/director/dashboard/${schoolId}/security/privacy` },
      ]
    },
  ];

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's a complete overview of your school.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

    

    