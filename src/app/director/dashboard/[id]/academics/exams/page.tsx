
import { getClassesForSchool } from "@/app/actions/academics";
import { ExamManager } from "@/components/ExamManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExamsPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
                <p className="text-muted-foreground">
                    Manage exam terms, schedules, and student marks.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Exam Dashboard</CardTitle>
                    <CardDescription>
                        Create and manage exam terms for the academic session.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ExamManager schoolId={schoolId} classes={classes} />
                </CardContent>
            </Card>
        </div>
    );
}
