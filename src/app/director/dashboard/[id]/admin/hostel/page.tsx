
import { HostelManager } from "@/components/hostel/HostelManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

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
       <Suspense fallback={<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <HostelManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
