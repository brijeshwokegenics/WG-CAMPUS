
import { GatePassManager } from "@/components/GatePassManager";

export default function FrontDeskDashboardPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Front Desk</h1>
        <p className="text-muted-foreground">
          Issue, track, and manage student and visitor gate passes.
        </p>
      </div>
      <GatePassManager schoolId={schoolId} />
    </div>
  );
}
