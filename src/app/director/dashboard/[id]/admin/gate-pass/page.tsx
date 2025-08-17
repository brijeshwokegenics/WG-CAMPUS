
import { GatePassManager } from "@/components/GatePassManager";

export default function GatePassPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gate Pass Management</h1>
        <p className="text-muted-foreground">
          Issue, track, and manage student gate passes.
        </p>
      </div>
      <GatePassManager schoolId={schoolId} />
    </div>
  );
}
