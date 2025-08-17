
import { HostelManager } from "@/components/hostel/HostelManager";

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
      <HostelManager schoolId={schoolId} />
    </div>
  );
}
