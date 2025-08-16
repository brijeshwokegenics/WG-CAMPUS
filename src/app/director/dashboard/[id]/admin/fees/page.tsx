
import { FeeManager } from "@/components/FeeManager";
import { getClassesForSchool, getStudentsForSchool } from "@/app/actions/academics";

export default async function FeeCollectionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: {
    name?: string;
    admissionId?: string;
    classId?: string;
  };
}) {
  const schoolId = params.id;
  const { name, admissionId, classId } = searchParams || {};

  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data : [];

  // Initial load of students if search params are present
  const studentResult =
    name || admissionId || classId
      ? await getStudentsForSchool({ schoolId, name, admissionId, classId })
      : [];

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
        <p className="text-muted-foreground">Collect fees, view payment history, and generate receipts for students.</p>
      </div>
      <FeeManager 
        schoolId={schoolId} 
        classes={classes || []}
        initialStudents={studentResult}
      />
    </div>
  );
}

    