

import { StudentList } from "@/components/StudentList";
import { StudentFilters } from "@/components/StudentFilters";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClassesForSchool } from "@/app/actions/academics";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


function StudentListSkeleton() {
    return (
        <div>
            <div className="overflow-x-auto border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-between space-x-2 py-4">
                 <Skeleton className="h-8 w-48" />
                 <div className="flex items-center gap-2">
                     <Skeleton className="h-8 w-24" />
                     <Skeleton className="h-8 w-16" />
                 </div>
                 <div className="flex items-center gap-2">
                     <Skeleton className="h-8 w-20" />
                     <Skeleton className="h-8 w-20" />
                 </div>
            </div>
        </div>
    )
}


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

  // Fetching classes here is still okay as it's a small dataset needed for filters
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
            <Suspense fallback={<StudentListSkeleton />}>
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
