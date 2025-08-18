
import { CalendarManager } from "@/components/communication/CalendarManager";
import { getEvents } from "@/app/actions/communication";

export default async function CalendarPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;
  const events = await getEvents(schoolId);
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">School Calendar</h1>
        <p className="text-muted-foreground">View important dates, holidays, and school events.</p>
      </div>
      <CalendarManager schoolId={schoolId} initialEvents={events} />
    </div>
  );
}
