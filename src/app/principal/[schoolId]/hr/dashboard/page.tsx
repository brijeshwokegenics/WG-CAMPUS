
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, ClipboardList, Wallet } from "lucide-react";
import Link from "next/link";

export default function HRDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Manage staff attendance and payroll.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href={`/principal/${schoolId}/hr/directory`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Staff Directory</CardTitle>
                            <BookUser className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View all school staff members.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/principal/${schoolId}/hr/attendance`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Staff Attendance</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Manage daily staff attendance.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/principal/${schoolId}/hr/salary`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Salary Setup</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Set up salary structures for staff.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/principal/${schoolId}/hr/payroll`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Payroll</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Generate and manage staff salaries.</p></CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
