
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { getSchools, toggleSchoolStatus } from "@/app/actions/school";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useEffect, useState, useTransition } from "react";

type School = {
  id: string;
  schoolId: string;
  schoolName: string;
  contactEmail: string;
  enabled: boolean;
};

export default function ManageSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchSchools = async () => {
    const { schools: fetchedSchools } = await getSchools();
    setSchools(fetchedSchools as School[] || []);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleToggleStatus = (schoolId: string, currentStatus: boolean) => {
    startTransition(async () => {
        // Optimistically update the UI
        setSchools(schools.map(s => s.schoolId === schoolId ? { ...s, enabled: !currentStatus } : s));

        const result = await toggleSchoolStatus(schoolId, !currentStatus);

        if (!result.success) {
            // Revert the UI change if the server action fails
            setSchools(schools.map(s => s.schoolId === schoolId ? { ...s, enabled: currentStatus } : s));
            alert(`Error: ${result.message}`);
        }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Schools</h1>
          <p className="text-muted-foreground">View, edit, and update the status of registered schools.</p>
        </div>
        <Link href="/super-admin/dashboard/create-school">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New School
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Schools</CardTitle>
          <CardDescription>A complete list of all schools in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {schools && schools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>School ID</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.schoolName}</TableCell>
                    <TableCell>{school.schoolId}</TableCell>
                    <TableCell>{school.contactEmail}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${school.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {school.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </TableCell>
                     <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(school.schoolId)}
                            >
                              Copy School ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                             <Link href={`/super-admin/dashboard/schools/edit/${school.id}`} passHref>
                                <DropdownMenuItem>View/Edit School</DropdownMenuItem>
                             </Link>
                            <DropdownMenuItem onClick={() => handleToggleStatus(school.schoolId, school.enabled)} disabled={isPending}>
                                {school.enabled ? 'Disable' : 'Enable'} School
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No schools have been created yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
