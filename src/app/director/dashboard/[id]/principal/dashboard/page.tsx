

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, ClipboardList, Calendar, Megaphone, CheckCircle, XCircle, AlertTriangle, Building } from "lucide-react";
import Link from "next/link";
import { getDailyAttendanceSummary } from "@/app/actions/academics";
import { getNotices, getEvents } from "@/app/actions/communication";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type StatCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}


export default async function PrincipalDashboardPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;

    const [attendanceResult, noticesResult, eventsResult] = await Promise.all([
        getDailyAttendanceSummary(schoolId),
        getNotices(schoolId),
        getEvents(schoolId)
    ]);
    
    const attendance = attendanceResult.success ? attendanceResult.data : { 'Present': 0, 'Absent': 0, 'Late': 0, 'Half Day': 0 };
    const recentNotices = noticesResult.slice(0, 4);
    const upcomingEvents = eventsResult
        .filter(e => e.start >= new Date())
        .sort((a,b) => a.start.getTime() - b.start.getTime())
        .slice(0, 4);

    const totalStudentsAttended = attendance.Present + attendance.Late + attendance['Half Day'];

    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Principal's Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Here's a snapshot of today's school activities.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Students Present" value={totalStudentsAttended} icon={<CheckCircle className="h-4 w-4 text-muted-foreground"/>}/>
                <StatCard title="Students Absent" value={attendance.Absent} icon={<XCircle className="h-4 w-4 text-muted-foreground"/>}/>
                <StatCard title="Staff on Leave" value="2" icon={<AlertTriangle className="h-4 w-4 text-muted-foreground"/>}/>
                 <Link href={`/director/dashboard/${schoolId}/academics/attendance`}>
                    <Card className="hover:bg-muted/50 transition-colors h-full flex flex-col justify-center">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-primary">Manage Attendance</p>
                                <Users className="h-6 w-6 text-primary"/>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href={`/director/dashboard/${schoolId}/academics/students`}>
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Student Management</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Search, view, and manage student profiles.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/hr/directory`}>
                     <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Staff Management</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">View staff directory and manage roles.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/principal/school-info`}>
                     <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">School Information</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">View general school details and profile.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Notices</CardTitle>
                        <CardDescription>Latest announcements for staff and students.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {recentNotices.length > 0 ? (
                           recentNotices.map(notice => (
                               <div key={notice.id} className="flex items-start gap-3">
                                   <Megaphone className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                   <div>
                                       <p className="font-semibold">{notice.title}</p>
                                       <p className="text-xs text-muted-foreground">
                                           For: {notice.audience.join(', ')} | Posted: {format(new Date(notice.postedAt), 'dd MMM, yyyy')}
                                       </p>
                                   </div>
                               </div>
                           ))
                       ) : (
                            <p className="text-sm text-center text-muted-foreground py-8">No recent notices found.</p>
                       )}
                       <Link href={`/director/dashboard/${schoolId}/communication/notices`} className="text-sm font-medium text-primary hover:underline pt-4 block text-right">
                           View All Notices &rarr;
                       </Link>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Upcoming holidays, exams, and school events.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {upcomingEvents.length > 0 ? (
                           upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-start gap-3">
                                   <Calendar className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                   <div>
                                       <p className="font-semibold">{event.title} <Badge variant="outline" className="ml-2">{event.type}</Badge></p>
                                       <p className="text-xs text-muted-foreground">
                                          Date: {format(new Date(event.start), 'dd MMM, yyyy')}
                                       </p>
                                   </div>
                               </div>
                           ))
                       ) : (
                             <p className="text-sm text-center text-muted-foreground py-8">No upcoming events.</p>
                       )}
                        <Link href={`/director/dashboard/${schoolId}/communication/calendar`} className="text-sm font-medium text-primary hover:underline pt-4 block text-right">
                           View Full Calendar &rarr;
                       </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
