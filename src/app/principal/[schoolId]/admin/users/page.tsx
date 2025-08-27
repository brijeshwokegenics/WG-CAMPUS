
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManager } from "@/components/UserManager";

export default function UserManagementPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Create and manage accounts for staff members like teachers, accountants, and librarians.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
          <CardDescription>
            Manage login credentials and roles for your school's staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UserManager schoolId={schoolId} />
        </CardContent>
      </Card>
    </div>
  );
}
