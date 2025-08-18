
import { PayrollManager } from "@/components/PayrollManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PayrollPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <p className="text-muted-foreground">
          Generate monthly payroll and view historical payroll data.
        </p>
      </div>
      <PayrollManager schoolId={schoolId} />
    </div>
  );
}
