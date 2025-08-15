
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DirectorDashboard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Director Dashboard</CardTitle>
          <CardDescription>Welcome to your dashboard. Manage your school from here.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="mb-4">This is a placeholder for the Director's dashboard.</p>
             <Link href="/school/login" passHref>
              <Button variant="outline">
                Logout
              </Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}

