
import { FeeStructureManager } from "@/components/FeeStructureManager";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default async function FeeStructurePage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Structure</h1>
        <p className="text-muted-foreground">
          Define fee components and assign them to different classes.
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <FeeStructureManager
          schoolId={schoolId}
        />
      </Suspense>
    </div>
  );
}
