
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, UserCog, Webhook } from "lucide-react";
import Link from "next/link";

export default function PrincipalDashboardPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Principal's Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Manage school staff and academic operations.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 <Link href={`/director/dashboard/${schoolId}/admin/users`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">User Management</CardTitle>
                            <UserCog className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Create and manage accounts for staff.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/academics/classes`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Academics</CardTitle>
                            <Building className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Manage classes, subjects, and students.</p></CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
