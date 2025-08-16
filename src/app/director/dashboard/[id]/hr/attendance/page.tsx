
import { StaffAttendanceManager } from "@/components/StaffAttendanceManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StaffAttendancePage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
        <p className="text-muted-foreground">
          Take and manage daily attendance for all staff members.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Sheet</CardTitle>
          <CardDescription>
            Select a date to take or view staff attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <StaffAttendanceManager schoolId={schoolId} />
        </CardContent>
      </Card>
    </div>
  );
}
