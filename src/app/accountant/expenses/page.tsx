
import { ExpenseManager } from "@/components/ExpenseManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ExpensesSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="lg:col-span-2">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    )
}

export default async function ExpensesPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
        <p className="text-muted-foreground">
          Record, categorize, and track all school expenditures.
        </p>
      </div>
       <Suspense fallback={<ExpensesSkeleton />}>
        <ExpenseManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
