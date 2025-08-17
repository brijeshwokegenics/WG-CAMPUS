import { InventoryManager } from "@/components/InventoryManager";

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
      <InventoryManager schoolId={schoolId} />
    </div>
  );
}
