
import { FeeManager } from "@/components/FeeManager";

export default async function FeeCollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-muted-foreground">Collect fees, view payment history, and generate receipts for students.</p>
      </div>
      <FeeManager 
        schoolId={schoolId} 
      />
    </div>
  );
}
