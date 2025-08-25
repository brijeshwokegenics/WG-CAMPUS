
import { AdmissionForm } from "@/components/AdmissionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdmissionsPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Student Admission</h1>
        <p className="text-muted-foreground">Fill out the form to enroll a new student in the school.</p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Admission Form</CardTitle>
            <CardDescription>Please provide all the required information for the new student.</CardDescription>
        </CardHeader>
        <CardContent>
            <AdmissionForm schoolId={schoolId} />
        </CardContent>
      </Card>
    </>
  );
}
