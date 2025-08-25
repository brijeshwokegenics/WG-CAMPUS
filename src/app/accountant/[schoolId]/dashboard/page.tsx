
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpensesSummary } from "@/app/actions/expenses";
import { getFeeCollectionsSummary } from "@/app/actions/finance";
import { Banknote, Receipt, Wallet } from "lucide-react";
import Link from "next/link";


const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};


export default async function AccountantDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;

    const [collectionsResult, expensesResult] = await Promise.all([
        getFeeCollectionsSummary(schoolId),
        getExpensesSummary(schoolId),
    ]);

    const collections = collectionsResult.success ? collectionsResult.data : { daily: 0, monthly: 0, yearly: 0 };
    const expenses = expensesResult.success ? expensesResult.data : { daily: 0, monthly: 0, yearly: 0 };


    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Accountant Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Manage all financial activities for the school.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Today's Collections</h4>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(collections.daily)}</p>
                    </div>
                     <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-semibold text-red-800 dark:text-red-300">Today's Expenses</h4>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses.daily)}</p>
                    </div>
                </CardContent>
            </Card>

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
                <Link href={`/accountant/${schoolId}/expenses`}>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Record and track school expenses.</p></CardContent>
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
