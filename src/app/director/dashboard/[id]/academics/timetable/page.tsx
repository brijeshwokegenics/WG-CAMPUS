
import { getClassesForSchool } from "@/app/actions/academics";
import { TimetableManager } from "@/components/TimetableManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TimetablePage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
        <p className="text-muted-foreground">
          Create, view, and manage class timetables.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class Timetable</CardTitle>
          <CardDescription>
            Select a class and section to view or edit the timetable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableManager schoolId={schoolId} classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}
