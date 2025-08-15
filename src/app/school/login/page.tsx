import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School } from "lucide-react";
import Link from "next/link";

export default function SchoolLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School size={48} className="text-primary"/>
          </div>
          <CardTitle className="text-3xl font-bold">School Portal Login</CardTitle>
          <CardDescription>Login as a Director, Principal, or Staff.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-id">School ID</Label>
              <Input id="school-id" placeholder="Enter your School ID" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </div>
          {/* This Link is temporary for navigation during development. It will be replaced with form handling logic. */}
          <Link href="/director/dashboard" passHref>
            <Button type="submit" className="w-full mt-6">
              Login
            </Button>
          </Link>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Back to main portal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
