
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Building } from "lucide-react";
import Link from "next/link";
import { readDb } from "@/app/actions/school";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

type School = {
  schoolId: string;
  schoolName: string;
  enabled: boolean;
};


export default function SuperAdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);

   useEffect(() => {
    async function fetchSchools() {
      const { schools: fetchedSchools } = await readDb();
      setSchools(fetchedSchools || []);
    }
    fetchSchools();
  }, []);


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
          <CardContent className="flex gap-4">
            <Link href="/super-admin/dashboard/create-school">
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create School
              </Button>
            </Link>
             <Link href="/super-admin/dashboard/schools">
              <Button size="lg" variant="outline">
                <Building className="mr-2 h-5 w-5" />
                Manage Schools
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Schools Overview</CardTitle>
            <CardDescription>A quick look at the most recently added schools.</CardDescription>
          </CardHeader>
          <CardContent>
            {schools && schools.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>School ID</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schools.slice(0, 5).map((school: any) => (
                    <TableRow key={school.schoolId}>
                        <TableCell className="font-medium">{school.schoolName}</TableCell>
                        <TableCell>{school.schoolId}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${school.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {school.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                <p>No schools have been created yet.</p>
                <p className="text-sm">Use the "Create School" button to add the first one.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
