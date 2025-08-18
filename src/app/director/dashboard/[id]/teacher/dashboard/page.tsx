
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ClipboardList, Book } from "lucide-react";
import Link from "next/link";

export default function TeacherDashboardPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Here are your tools for the day.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href={`/teacher/${schoolId}/academics/attendance`}>
                    <Card className="hover:bg-muted/50 transition-colors">
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
                     <Card className="hover:bg-muted/50 transition-colors">
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
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">E-learning</CardTitle>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                             <p className="text-xs text-muted-foreground">Manage homework & study materials.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

