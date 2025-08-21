
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Wallet, FileText, Book } from "lucide-react";
import Link from "next/link";

export default function ParentDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Parent Dashboard</h1>
                <p className="text-muted-foreground">Welcome! View your child's information and activities.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 <Link href={`/parent/${schoolId}/profile`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Child's Profile</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View your child's details.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/attendance`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Check daily attendance records.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/fees`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fees</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View fee dues and payment history.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/reports`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Report Cards</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Download academic report cards.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/elearning`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">E-learning & Homework</CardTitle>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Access study materials.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/calendar`}>
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
