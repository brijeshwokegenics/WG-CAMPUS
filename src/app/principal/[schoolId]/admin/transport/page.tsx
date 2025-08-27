
import { TransportManager } from "@/components/transport/TransportManager";
import { getClassesForSchool } from "@/app/actions/academics";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function TransportContent({ schoolId }: { schoolId: string}) {
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];
  return <TransportManager schoolId={schoolId} classes={classes} />;
}

function TransportSkeleton() {
  return (
      <Card>
          <CardContent className="pt-6">
              <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
              </div>
          </CardContent>
      </Card>
  )
}

export default async function TransportPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
        <p className="text-muted-foreground">
          Manage vehicles, routes, and student transport assignments.
        </p>
      </div>
      <Suspense fallback={<TransportSkeleton />}>
        <TransportContent schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
