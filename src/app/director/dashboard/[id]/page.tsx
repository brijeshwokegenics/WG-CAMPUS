
import { getDashboardSummary } from "@/app/actions/academics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, BarChart3, Receipt, CircleDollarSign } from "lucide-react";
import Link from "next/link";

type StatCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    link?: string;
    linkText?: string;
}

function StatCard({ title, value, icon, link, linkText }: StatCardProps) {
    const cardContent = (
        <CardContent>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className="p-3 bg-muted rounded-full">
                    {icon}
                </div>
            </div>
             {link && linkText && (
                <Link href={link} className="text-xs text-primary hover:underline mt-2 inline-block">
                    {linkText}
                </Link>
             )}
        </CardContent>
    );

    return (
        <Card>
           {cardContent}
        </Card>
    );
}

export default async function DirectorDashboardPage({ params }: { params: { id: string }}) {
  const schoolId = params.id;
  const summaryResult = await getDashboardSummary(schoolId);
  const summary = summaryResult.success ? summaryResult.data : { totalStudents: 0, totalStaff: 0, totalClasses: 0 };

  return (
    <div className="space-y-6">
        <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Director's Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your school's activities.</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard 
                title="Total Students" 
                value={summary.totalStudents} 
                icon={<Users className="h-6 w-6 text-primary"/>} 
                link={`/director/dashboard/${schoolId}/academics/students`}
                linkText="Manage Students"
            />
            <StatCard 
                title="Total Staff" 
                value={summary.totalStaff} 
                icon={<Briefcase className="h-6 w-6 text-primary"/>}
                link={`/director/dashboard/${schoolId}/hr/directory`}
                linkText="View Staff"
            />
            <StatCard 
                title="Total Classes" 
                value={summary.totalClasses} 
                icon={<GraduationCap className="h-6 w-6 text-primary"/>} 
                link={`/director/dashboard/${schoolId}/academics/classes`}
                linkText="Manage Classes"
            />
            <StatCard 
                title="Total Collection" 
                value="₹0"
                icon={<CircleDollarSign className="h-6 w-6 text-primary"/>}
                link={`/director/dashboard/${schoolId}/admin/fees`}
                linkText="View Fees"
             />
        </div>
        
        {/* Placeholder for charts and recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Attendance Overview</CardTitle>
                    <CardDescription>Student attendance for the current month.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center bg-muted/50 rounded-b-lg">
                   <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-10 w-10 mx-auto mb-2"/>
                        <p>Attendance chart coming soon</p>
                   </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Recent Fee Collections</CardTitle>
                    <CardDescription>Latest payments received.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center bg-muted/50 rounded-b-lg">
                    <div className="text-center text-muted-foreground">
                        <Receipt className="h-10 w-10 mx-auto mb-2"/>
                        <p>Fee activity feed coming soon</p>
                   </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
