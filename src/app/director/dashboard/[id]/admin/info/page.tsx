
import { getSchool } from "@/app/actions/school";
import { SchoolInfoForm } from "@/components/SchoolInfoForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function SchoolInfoPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const { school, error } = await getSchool(schoolId);

  if (error || !school) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School Information</h1>
        <p className="text-muted-foreground">
          View and update your school's general details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>School Profile</CardTitle>
          <CardDescription>
            This information is used across the ERP system, including on printed documents like receipts and report cards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchoolInfoForm school={school} />
        </CardContent>
      </Card>
    </div>
  );
}
