
import { StudentList } from "@/components/StudentList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Suspense } from "react";


export default function StudentsPage({ params, searchParams }: { params: { id: string }, searchParams?: { query?: string; }}) {
  const schoolId = params.id;
  const query = searchParams?.query || '';


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
            <div className="mb-4">
              <Search placeholder="Search students by name, admission ID, or class..." />
            </div>
            <Suspense fallback={<p>Loading students...</p>}>
                <StudentList schoolId={schoolId} query={query} />
            </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
