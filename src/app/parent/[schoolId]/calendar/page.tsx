
import { Suspense } from "react";
import { CalendarManager } from "@/components/communication/CalendarManager";
import { getEvents } from "@/app/actions/communication";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
        <Link href={`/parent/${schoolId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
       <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent schoolId={schoolId} />
      </Suspense>
    </div>
  );
}


    