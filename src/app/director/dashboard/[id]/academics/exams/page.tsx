
import { Suspense } from "react";
import { getClassesForSchool } from "@/app/actions/academics";
import { ExamManager } from "@/components/ExamManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function ExamContent({ schoolId }: { schoolId: string }) {
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];
    return <ExamManager schoolId={schoolId} classes={classes} />;
}

function ExamSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Exam Dashboard</CardTitle>
                <CardDescription>
                    Create and manage exam terms for the academic session.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                     </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default async function ExamsPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
                <p className="text-muted-foreground">
                    Manage exam terms, schedules, and student marks.
                </p>
            </div>
            <Suspense fallback={<ExamSkeleton />}>
                <ExamContent schoolId={schoolId} />
            </Suspense>
        </div>
    );
}
