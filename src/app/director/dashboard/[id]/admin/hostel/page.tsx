
import { HostelManager } from "@/components/hostel/HostelManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function HostelSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader><CardTitle><Skeleton className="h-6 w-32" /></CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                 <Card>
                     <CardHeader><CardTitle><Skeleton className="h-6 w-48" /></CardTitle></CardHeader>
                     <CardContent>
                         <Skeleton className="h-48 w-full" />
                     </CardContent>
                 </Card>
            </div>
        </div>
    )
}

export default function HostelPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hostel Management</h1>
        <p className="text-muted-foreground">
          Manage hostel buildings, rooms, and student allocations.
        </p>
      </div>
       <Suspense fallback={<HostelSkeleton />}>
        <HostelManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
