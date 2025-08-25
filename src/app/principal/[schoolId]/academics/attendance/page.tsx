
import { Suspense } from "react";
import { getClassesForSchool } from "@/app/actions/academics";
import { StudentAttendance } from "@/components/StudentAttendance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function AttendanceContent({ schoolId }: { schoolId: string }) {
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];
  return <StudentAttendance schoolId={schoolId} classes={classes} />;
}

function AttendanceSkeleton() {
    return (
        <Card>
            <CardHeader>
              <CardTitle>Attendance Sheet</CardTitle>
              <CardDescription>
                Select a class, section, and date to take or view attendance.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                     <div className="text-center py-10 border rounded-lg bg-muted/50">
                        <Skeleton className="h-6 w-1/2 mx-auto" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default async function StudentAttendancePage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Attendance</h1>
        <p className="text-muted-foreground">
          Take and manage daily attendance for students.
        </p>
      </div>
       <Suspense fallback={<AttendanceSkeleton />}>
            <AttendanceContent schoolId={schoolId} />
       </Suspense>
    </div>
  );
}
