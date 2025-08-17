
import { getClassesForSchool } from "@/app/actions/academics";
import { getUsersForSchool } from "@/app/actions/users";
import { MessagingManager } from "@/components/communication/MessagingManager";

export default async function MessagingPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const classResult = await getClassesForSchool(schoolId);
  const classes = classResult.success ? classResult.data ?? [] : [];
  
  const usersResult = await getUsersForSchool(schoolId);
  const users = usersResult.success ? usersResult.data ?? [] : [];

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
        <p className="text-muted-foreground">Send announcements and messages to individuals or groups.</p>
      </div>
      <MessagingManager schoolId={schoolId} classes={classes} users={users} />
    </div>
  );
}
