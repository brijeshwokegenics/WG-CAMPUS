
import { getClassesForSchool, getExamTerms } from "@/app/actions/academics";
import { ReportCardGenerator } from "@/components/ReportCardGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];
    
    const termsResult = await getExamTerms(schoolId);
    const examTerms = termsResult.success ? termsResult.data ?? [] : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Academic Reports</h1>
                <p className="text-muted-foreground">
                    Generate and view student report cards and other academic reports.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Report Card Generator</CardTitle>
                    <CardDescription>
                        Select a class, section, and student to generate a report card. You can combine multiple exam results.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportCardGenerator schoolId={schoolId} classes={classes} examTerms={examTerms} />
                </CardContent>
            </Card>
        </div>
    );
}
