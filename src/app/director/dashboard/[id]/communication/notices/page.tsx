
import { getClassesForSchool } from "@/app/actions/academics";
import { NoticeManager } from "@/components/communication/NoticeManager";

export default async function NoticesPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];
  
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
        <p className="text-muted-foreground">Post and manage announcements for students, teachers, or everyone.</p>
      </div>
      <NoticeManager schoolId={schoolId} classes={classes} />
    </div>
  );
}
