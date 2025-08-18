
import { InventoryManager } from "@/components/InventoryManager";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function InventorySkeleton() {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

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
      <Suspense fallback={<InventorySkeleton />}>
        <InventoryManager schoolId={schoolId} />
      </Suspense>
    </div>
  );
}
