
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClipboardList, Book, GraduationCap, Users } from "lucide-react";
import Link from "next/link";
import { getEvents } from "@/app/actions/communication";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function TeacherDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;

    const events = await getEvents(schoolId);
    const upcomingEvents = events
        .filter(e => e.start >= new Date())
        .sort((a,b) => a.start.getTime() - b.start.getTime())
        .slice(0, 4);

    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Here are your tools for the day.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <Link href={`/teacher/${schoolId}/academics/attendance`}>
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Student Attendance</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Take and manage daily attendance.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/teacher/${schoolId}/academics/timetable`}>
                     <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">My Timetable</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <p className="text-xs text-muted-foreground">View your daily class schedule.</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href={`/teacher/${schoolId}/academics/elearning`}>
                     <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">E-learning</CardTitle>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <p className="text-xs text-muted-foreground">Manage homework & study materials.</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href={`/teacher/${schoolId}/academics/classes`}>
                     <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <p className="text-xs text-muted-foreground">View all classes and sections.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
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
                   <Link href={`/teacher/${schoolId}/communication/calendar`} className="text-sm text-primary hover:underline mt-auto pt-4">
                        View Full Calendar
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
