
import { getDashboardSummary } from "@/app/actions/academics";
import { getNotices, getEvents } from "@/app/actions/communication";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, BarChart3, Receipt, CircleDollarSign, Megaphone, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
  const [summaryResult, noticesResult, eventsResult] = await Promise.all([
      getDashboardSummary(schoolId),
      getNotices(schoolId),
      getEvents(schoolId),
  ]);

  const summary = summaryResult.success ? summaryResult.data : { totalStudents: 0, totalStaff: 0, totalClasses: 0 };
  const recentNotices = noticesResult.slice(0, 4); // getNotices is already sorted by date
  const upcomingEvents = eventsResult.filter(e => e.start >= new Date()).sort((a,b) => a.start.getTime() - b.start.getTime()).slice(0, 4);


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
