import { getDashboardSummary } from "@/app/actions/academics";
import { getNotices, getEvents } from "@/app/actions/communication";
import { getFeeCollectionsSummary } from "@/app/actions/finance";
import { getExpensesSummary } from "@/app/actions/expenses";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, BarChart3, Receipt, CircleDollarSign, Megaphone, Calendar, TrendingUp, TrendingDown, School } from "lucide-react";
import Link from "next/link";
import { format, startOfToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StudentRegistrationChart } from "@/components/StudentRegistrationChart";


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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export default async function DirectorDashboardPage({ params }: { params: { id: string }}) {
  const schoolId = params.id;
  const [summaryResult, noticesResult, eventsResult, collectionsResult, expensesResult] = await Promise.all([
      getDashboardSummary(schoolId),
      getNotices(schoolId),
      getEvents(schoolId),
      getFeeCollectionsSummary(schoolId),
      getExpensesSummary(schoolId),
  ]);

  const summary = summaryResult.success ? summaryResult.data : { totalStudents: 0, totalStaff: 0, totalClasses: 0, registrations: [] };
  const collections = collectionsResult.success ? collectionsResult.data : { daily: 0, monthly: 0, yearly: 0 };
  const expenses = expensesResult.success ? expensesResult.data : { daily: 0, monthly: 0, yearly: 0 };

  const recentNotices = noticesResult.slice(0, 4);
  
  const today = startOfToday();
  const upcomingEvents = eventsResult
    .filter(e => e.end >= today)
    .sort((a,b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);


  return (
    <div className="space-y-6">
        <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Principal's Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your school's activities.</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        </div>
        
        {/* Financial Summary */}
        <Card>
            <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>A summary of fee collections and expenses.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-center mb-2">Today's Activity</h4>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Collection</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(collections.daily)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Expense</p>
                            <p className="text-xl font-bold text-red-600">{formatCurrency(expenses.daily)}</p>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-center mb-2">This Month</h4>
                     <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Collection</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(collections.monthly)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Expense</p>
                            <p className="text-xl font-bold text-red-600">{formatCurrency(expenses.monthly)}</p>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-center mb-2">This Year</h4>
                     <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Collection</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(collections.yearly)}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Expense</p>
                            <p className="text-xl font-bold text-red-600">{formatCurrency(expenses.yearly)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
         {/* Session-wise Registration Chart */}
        <Card>
            <CardHeader>
                <CardTitle>Student Registrations by Session</CardTitle>
                <CardDescription>Number of new student admissions per academic session.</CardDescription>
            </CardHeader>
            <CardContent>
                {summary.registrations && summary.registrations.length > 0 ? (
                    <StudentRegistrationChart data={summary.registrations} />
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <School className="h-12 w-12 mx-auto mb-2" />
                        <p>No registration data available to display the chart.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Notices</CardTitle>
                    <CardDescription>Latest announcements and communications.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex flex-col">
                   {recentNotices.length > 0 ? (
                       <ul className="space-y-4">
                           {recentNotices.map(notice => (
                               <li key={notice.id} className="flex items-start gap-4">
                                   <div className="bg-muted p-2 rounded-full">
                                       <Megaphone className="h-5 w-5 text-primary"/>
                                   </div>
                                   <div>
                                       <p className="font-semibold">{notice.title}</p>
                                       <p className="text-xs text-muted-foreground">
                                           Posted on {format(new Date(notice.postedAt), 'dd MMM, yyyy')} for {notice.audience.join(', ')}
                                       </p>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : (
                        <div className="m-auto text-center text-muted-foreground">
                            <Megaphone className="h-10 w-10 mx-auto mb-2"/>
                            <p>No recent notices</p>
                        </div>
                   )}
                   <Link href={`/director/dashboard/${schoolId}/communication/notices`} className="text-sm text-primary hover:underline mt-auto pt-4">
                        View All Notices
                    </Link>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Upcoming holidays, exams, and school events.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex flex-col">
                   {upcomingEvents.length > 0 ? (
                       <ul className="space-y-4">
                           {upcomingEvents.map(event => (
                               <li key={event.id} className="flex items-start gap-4">
                                   <div className="flex flex-col items-center bg-muted p-2 rounded-md">
                                       <span className="text-xs font-bold text-primary">{format(new Date(event.start), 'MMM')}</span>
                                       <span className="text-lg font-bold">{format(new Date(event.start), 'dd')}</span>
                                   </div>
                                   <div>
                                       <p className="font-semibold">{event.title}</p>
                                       <Badge variant="outline">{event.type}</Badge>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   ) : (
                        <div className="m-auto text-center text-muted-foreground">
                            <Calendar className="h-10 w-10 mx-auto mb-2"/>
                            <p>No upcoming events</p>
                        </div>
                   )}
                   <Link href={`/director/dashboard/${schoolId}/communication/calendar`} className="text-sm text-primary hover:underline mt-auto pt-4">
                        View Full Calendar
                    </Link>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
