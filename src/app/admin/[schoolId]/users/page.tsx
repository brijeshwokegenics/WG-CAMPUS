
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManager } from "@/components/UserManager";

export default function UserManagementPage({ params }: { params: { schoolId: string } }) {
  const schoolId = params.schoolId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Create and manage accounts for parents.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Parent Accounts</CardTitle>
          <CardDescription>
            Manage login credentials for parents.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <UserManager schoolId={schoolId} roleFilter="Parent" />
        </CardContent>
      </Card>
    </div>
  );
}

    