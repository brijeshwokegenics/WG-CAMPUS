
import { getClassesForSchool } from "@/app/actions/academics";
import { ElearningManager } from "@/components/ElearningManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ElearningPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">E-learning Management</h1>
        <p className="text-muted-foreground">
          Upload and manage study materials and homework assignments for your classes.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Content Manager</CardTitle>
          <CardDescription>
            Select a class and section to manage their e-learning content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ElearningManager schoolId={schoolId} classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}
