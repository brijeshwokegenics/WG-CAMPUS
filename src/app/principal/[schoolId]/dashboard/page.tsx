
import { getDailyAttendanceSummary, getDashboardSummary } from "@/app/actions/academics";
import { getEvents, getNotices } from "@/app/actions/communication";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfToday } from "date-fns";
import { Briefcase, Calendar, ClipboardList, Megaphone, UserCheck, UserX, GraduationCap, Users } from "lucide-react";
import Link from "next/link";


type StatCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon}: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default async function PrincipalDashboardPage({ params }: { params: { schoolId: string }}) {
  const schoolId = params.schoolId;
  const [summaryResult, noticesResult, eventsResult, studentAttendanceResult] = await Promise.all([
      getDashboardSummary(schoolId),
      getNotices(schoolId),
      getEvents(schoolId),
      getDailyAttendanceSummary(schoolId),
  ]);

  const summary = summaryResult.success ? summaryResult.data : { totalStudents: 0, totalStaff: 0 };
  const studentAttendance = studentAttendanceResult.success ? studentAttendanceResult.data : { Present: 0, Absent: 0 };
  
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
            <p className="text-muted-foreground">Welcome! Here's a snapshot of today's school activity.</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={summary.totalStudents} icon={<Users className="h-4 w-4 text-muted-foreground"/>} />
            <StatCard title="Total Staff" value={summary.totalStaff} icon={<Briefcase className="h-4 w-4 text-muted-foreground"/>} />
            <StatCard title="Students Present" value={studentAttendance.Present} icon={<UserCheck className="h-4 w-4 text-muted-foreground"/>} />
            <StatCard title="Students Absent" value={studentAttendance.Absent} icon={<UserX className="h-4 w-4 text-muted-foreground"/>} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Link href={`/director/dashboard/${schoolId}/academics/attendance`}>
                        <Button variant="outline" className="w-full h-20 flex-col gap-1">
                           <ClipboardList className="h-6 w-6"/>
                           <span>Student Attendance</span>
                        </Button>
                    </Link>
                    <Link href={`/director/dashboard/${schoolId}/hr/attendance`}>
                        <Button variant="outline" className="w-full h-20 flex-col gap-1">
                            <ClipboardList className="h-6 w-6"/>
                            <span>Staff Attendance</span>
                        </Button>
                    </Link>
                    <Link href={`/director/dashboard/${schoolId}/communication/notices`}>
                        <Button variant="outline" className="w-full h-20 flex-col gap-1">
                            <Megaphone className="h-6 w-6"/>
                            <span>Post a Notice</span>
                        </Button>
                    </Link>
                     <Link href={`/director/dashboard/${schoolId}/communication/calendar`}>
                        <Button variant="outline" className="w-full h-20 flex-col gap-1">
                           <Calendar className="h-6 w-6"/>
                           <span>Manage Events</span>
                        </Button>
                    </Link>
                </CardContent>
            </Card>

             {/* Upcoming Events */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Upcoming Events & Notices</CardTitle>
                    <CardDescription>Upcoming holidays, exams, and recent announcements.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <h4 className="font-semibold mb-2">Events</h4>
                        {upcomingEvents.length > 0 ? (
                        <ul className="space-y-4">
                            {upcomingEvents.map(event => (
                                <li key={event.id} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center bg-muted p-2 rounded-md">
                                        <span className="text-xs font-bold text-primary">{format(new Date(event.start), 'MMM')}</span>
                                        <span className="text-lg font-bold">{format(new Date(event.start), 'dd')}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <Badge variant="outline">{event.type}</Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        ) : (
                                <div className="m-auto text-center text-muted-foreground text-sm py-4">
                                    <Calendar className="h-8 w-8 mx-auto mb-2"/>
                                    <p>No upcoming events</p>
                                </div>
                        )}
                   </div>
                   <div>
                         <h4 className="font-semibold mb-2">Notices</h4>
                        {recentNotices.length > 0 ? (
                        <ul className="space-y-4">
                            {recentNotices.map(notice => (
                                <li key={notice.id} className="flex items-start gap-4">
                                    <div className="bg-muted p-2 rounded-full mt-1">
                                        <Megaphone className="h-5 w-5 text-primary"/>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{notice.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            For {notice.audience.join(', ')}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        ) : (
                                <div className="m-auto text-center text-muted-foreground text-sm py-4">
                                    <Megaphone className="h-8 w-8 mx-auto mb-2"/>
                                    <p>No recent notices</p>
                                </div>
                        )}
                   </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
