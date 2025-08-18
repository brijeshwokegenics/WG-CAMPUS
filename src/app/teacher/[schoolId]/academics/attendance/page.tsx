
import { getClassesForSchool } from "@/app/actions/academics";
import { StudentAttendance } from "@/components/StudentAttendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentAttendancePage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
        <p className="text-muted-foreground">
          Take and manage daily attendance for your classes.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Sheet</CardTitle>
          <CardDescription>
            Select a class, section, and date to take or view attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentAttendance schoolId={schoolId} classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}
