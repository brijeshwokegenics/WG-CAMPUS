import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { School } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School size={48} className="text-primary"/>
          </div>
          <CardTitle className="text-3xl font-bold">WG Campus ERP</CardTitle>
          <CardDescription>The comprehensive solution for modern educational institutions.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-muted-foreground">
            Please select your login portal to continue.
          </p>
          <Link href="/super-admin/login" passHref>
            <Button size="lg" className="w-full">
              Super Admin Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
