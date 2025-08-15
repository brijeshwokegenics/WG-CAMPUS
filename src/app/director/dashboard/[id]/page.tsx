
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DirectorDashboardPage() {
  return (
    <div>
        <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Director Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your school's activities.</p>
        </header>
        <Card>
            <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>This is your new advanced director dashboard. More widgets and features are coming soon.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>You can start by exploring the new navigation options in the sidebar.</p>
            </CardContent>
        </Card>
    </div>
  );
}
