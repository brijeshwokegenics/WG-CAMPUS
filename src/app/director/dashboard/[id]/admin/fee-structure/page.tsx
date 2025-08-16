
import { getClassesForSchool } from "@/app/actions/academics";
import { getFeeHeads } from "@/app/actions/finance";
import { FeeStructureManager } from "@/components/FeeStructureManager";

export default async function FeeStructurePage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const classResult = await getClassesForSchool(schoolId);
  const feeHeadsResult = await getFeeHeads(schoolId);

  const classes = classResult.success ? classResult.data : [];
  const feeHeads = feeHeadsResult.success ? feeHeadsResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Structure</h1>
        <p className="text-muted-foreground">
          Define fee components and assign them to different classes.
        </p>
      </div>
      <FeeStructureManager
        schoolId={schoolId}
        allClasses={classes || []}
        initialFeeHeads={feeHeads || []}
      />
    </div>
  );
}
