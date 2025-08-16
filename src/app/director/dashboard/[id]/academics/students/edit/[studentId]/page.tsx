
import { getStudentById, getClassesForSchool } from "@/app/actions/academics";
import { StudentForm } from "@/components/StudentForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";


export default async function EditStudentPage({ params }: { params: { id: string; studentId: string } }) {
  const { id: schoolId, studentId } = params;

  const studentResult = await getStudentById(studentId, schoolId);
  if (!studentResult.success || !studentResult.data) {
    notFound();
  }
  
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data : [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Student Profile</h1>
        <p className="text-muted-foreground">Update the details for {studentResult.data.studentName}.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Student Information Form</CardTitle>
            <CardDescription>Modify the student's information below. Click save when you're done.</CardDescription>
        </CardHeader>
        <CardContent>
            <StudentForm 
                schoolId={schoolId} 
                studentData={studentResult.data} 
                classes={classes || []}
            />
        </CardContent>
      </Card>
    </>
  );
}
