
import { Suspense } from "react";
import { CalendarManager } from "@/components/communication/CalendarManager";
import { getEvents } from "@/app/actions/communication";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function CalendarContent({ schoolId }: { schoolId: string }) {
    const events = await getEvents(schoolId);
    return <CalendarManager schoolId={schoolId} initialEvents={events} />;
}

function CalendarSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[400px] w-full" />
            </CardContent>
        </Card>
    )
}

export default async function CalendarPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
        <p className="text-muted-foreground">Manage and view important dates, holidays, and school events.</p>
      </div>
       <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
