
import { Suspense } from "react";
import { getClassesForSchool, getExamTerms } from "@/app/actions/academics";
import { ReportCardGenerator } from "@/components/ReportCardGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function ReportContent({ schoolId }: { schoolId: string }) {
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];
    
    const termsResult = await getExamTerms(schoolId);
    const examTerms = termsResult.success ? termsResult.data ?? [] : [];

    return <ReportCardGenerator schoolId={schoolId} classes={classes} examTerms={examTerms} />;
}

function ReportSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Card Generator</CardTitle>
                <CardDescription>
                    Select a class, section, and student to generate a report card. You can combine multiple exam results.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                         <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default async function ReportsPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Academic Reports</h1>
                <p className="text-muted-foreground">
                    Generate and view student report cards and other academic reports.
                </p>
            </div>
             <Suspense fallback={<ReportSkeleton />}>
                <ReportContent schoolId={schoolId} />
            </Suspense>
        </div>
    );
}
