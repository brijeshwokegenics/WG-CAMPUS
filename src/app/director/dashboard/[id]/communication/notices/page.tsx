
import { Suspense } from "react";
import { getClassesForSchool } from "@/app/actions/academics";
import { NoticeManager } from "@/components/communication/NoticeManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function NoticesContent({ schoolId }: { schoolId: string }) {
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];
    return <NoticeManager schoolId={schoolId} classes={classes} />;
}

function NoticesSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    );
}

export default async function NoticesPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
        <p className="text-muted-foreground">Post and manage announcements for students, teachers, or everyone.</p>
      </div>
      <Suspense fallback={<NoticesSkeleton />}>
        <NoticesContent schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
