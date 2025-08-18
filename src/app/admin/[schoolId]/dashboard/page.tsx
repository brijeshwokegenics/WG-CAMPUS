
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, Users, MessageSquare, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Manage parent accounts, communication, and student records.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 <Link href={`/admin/${schoolId}/users`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Parent Management</CardTitle>
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Add or manage parent accounts.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/director/dashboard/${schoolId}/academics/students`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Student Directory</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View all student records.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/communication/notices`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Notice Board</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Post announcements for parents.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/communication/messaging`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Messaging</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Send messages to parents.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/director/dashboard/${schoolId}/communication/calendar`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">School Calendar</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View school events and holidays.</p></CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
