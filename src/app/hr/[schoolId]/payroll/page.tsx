
import { PayrollManager } from "@/components/PayrollManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function PayrollSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate & View Payroll</CardTitle>
                <CardDescription>Select a month to run payroll, or view previously generated records.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg mb-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-48" />
                    </div>
                    <Skeleton className="h-10 w-full md:w-36" />
                </div>
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    )
}

export default function PayrollPage({ params }: { params: { schoolId:string } }) {
  const schoolId = params.schoolId;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <p className="text-muted-foreground">
          Generate monthly payroll and view historical payroll data.
        </p>
      </div>
      <Suspense fallback={<PayrollSkeleton />}>
        <PayrollManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
