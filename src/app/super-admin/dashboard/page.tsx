import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage schools and monitor the system.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/super-admin/dashboard/create-school">
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create School
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Schools</CardTitle>
            <CardDescription>View and manage all registered schools.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No schools have been created yet.</p>
              <p className="text-sm">Use the "Create School" button to add the first one.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
