
import { getClassesForSchool } from "@/app/actions/academics";
import { PromoteStudentsForm } from "@/components/PromoteStudentsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PromoteStudentsPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data : [];

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Promote Students</h1>
        <p className="text-muted-foreground">Move students to the next class for the new academic session.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Promotion Tool</CardTitle>
          <CardDescription>
            Select the current class and the class to promote to. Then, select the students you wish to promote.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <PromoteStudentsForm schoolId={schoolId} classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}
