
import { StudentList } from "@/components/StudentList";
import { StudentFilters } from "@/components/StudentFilters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClassesForSchool } from "@/app/actions/academics";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";


export default async function StudentsPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams?: { 
    name?: string; 
    admissionId?: string;
    classId?: string;
    section?: string;
  }
}) {
  const schoolId = params.id;
  const name = searchParams?.name || '';
  const admissionId = searchParams?.admissionId || '';
  const classId = searchParams?.classId || '';
  const section = searchParams?.section || '';

  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data : [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">Search and manage all students in your school.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Student Directory</CardTitle>
            <CardDescription>A complete list of all students currently enrolled.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-6">
              <StudentFilters classes={classes || []} />
            </div>
            <Suspense fallback={<div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <StudentList 
                    schoolId={schoolId} 
                    name={name}
                    admissionId={admissionId}
                    classId={classId}
                    section={section}
                />
            </Suspense>
        </CardContent>
      </Card>
    </>
  );
}

    