
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Wallet } from "lucide-react";
import Link from "next/link";

export default function AccountantDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Accountant Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Manage all financial activities for the school.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link href={`/accountant/${schoolId}/fees`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Collect fees and view student history.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/accountant/${schoolId}/fee-structure`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fee Structure</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Define fee heads and class structures.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/accountant/${schoolId}/payroll`}>
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
