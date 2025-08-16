
import { InventoryManager } from "@/components/InventoryManager";
import { getItemCategories, getInventoryItems } from "@/app/actions/inventory";

export default async function InventoryPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  
  // Pre-fetch initial data on the server
  const categoriesResult = await getItemCategories(schoolId);
  const itemsResult = await getInventoryItems(schoolId);

  const initialCategories = categoriesResult.success ? categoriesResult.data : [];
  const initialItems = itemsResult.success ? itemsResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Track and manage school assets, supplies, and stock levels.
        </p>
      </div>
      <InventoryManager
        schoolId={schoolId}
        initialCategories={initialCategories as any[]}
        initialItems={initialItems as any[]}
      />
    </div>
  );
}
