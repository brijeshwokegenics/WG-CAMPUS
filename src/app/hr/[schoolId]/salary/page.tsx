
import { StaffSalaryManager } from "@/components/StaffSalaryManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffSalaryPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Salary Management</h1>
        <p className="text-muted-foreground">
          Set up and manage salary structures for all staff members.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Salary Setup</CardTitle>
          <CardDescription>
            Define basic salary, allowances, and deductions for each staff member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffSalaryManager schoolId={schoolId} />
        </CardContent>
      </Card>
    </div>
  );
}
