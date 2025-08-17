import { InventoryManager } from "@/components/InventoryManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function InventoryPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Track and manage school assets, supplies, and equipment.
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <InventoryManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
