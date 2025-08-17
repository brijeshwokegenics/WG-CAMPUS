import { TransportManager } from "@/components/transport/TransportManager";
import { getClassesForSchool } from "@/app/actions/academics";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function TransportPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
        <p className="text-muted-foreground">
          Manage vehicles, routes, and student transport assignments.
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <TransportManager schoolId={schoolId} classes={classes} />
      </Suspense>
    </div>
  );
}
