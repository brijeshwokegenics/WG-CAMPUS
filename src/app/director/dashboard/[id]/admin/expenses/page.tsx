
import { ExpenseManager } from "@/components/ExpenseManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function ExpensesPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
        <p className="text-muted-foreground">
          Record, categorize, and track all school expenditures.
        </p>
      </div>
       <Suspense fallback={<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <ExpenseManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
