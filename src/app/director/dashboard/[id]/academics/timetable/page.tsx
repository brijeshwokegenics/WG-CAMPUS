
import { Suspense } from "react";
import { getClassesForSchool } from "@/app/actions/academics";
import { TimetableManager } from "@/components/TimetableManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function TimetableContent({ schoolId }: { schoolId: string }) {
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];
    return <TimetableManager schoolId={schoolId} classes={classes} />;
}

function TimetableSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Class Timetable</CardTitle>
                <CardDescription>
                    Select a class and section to view or edit the timetable.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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


export default async function TimetablePage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
        <p className="text-muted-foreground">
          Create, view, and manage class timetables.
        </p>
      </div>
      <Suspense fallback={<TimetableSkeleton />}>
        <TimetableContent schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
