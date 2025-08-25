
import { getClassesForSchool } from "@/app/actions/academics";
import { PromoteStudentsForm } from "@/components/PromoteStudentsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function PromoteSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Promotion Tool</CardTitle>
                <CardDescription>
                    Select the current class and the class to promote to. Then, select the students you wish to promote.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 p-4 border rounded-lg">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                     <div className="space-y-4 p-4 border rounded-lg">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                        <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

async function PromoteContent({ schoolId }: { schoolId: string }) {
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];

    return (
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
    );
}


export default async function PromoteStudentsPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Promote Students</h1>
        <p className="text-muted-foreground">Move students to the next class for the new academic session.</p>
      </div>
      <Suspense fallback={<PromoteSkeleton />}>
        <PromoteContent schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
