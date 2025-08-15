
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getClasses } from '@/app/actions/academics';

type Class = {
  id: string;
  name: string;
  section: string;
  teacher: string;
  studentCount: number;
};

export default function ClassesPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      const result = await getClasses(schoolId);
      if (result.error) {
        setError(result.error);
      } else {
        setClasses(result.classes as Class[]);
      }
      setLoading(false);
    };

    fetchClasses();
  }, [schoolId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes & Sections</h1>
          <p className="text-muted-foreground">Manage all the classes and sections in your school.</p>
        </div>
        <Link href={`/director/dashboard/${schoolId}/academics/classes/new`}>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Class
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of all active classes and their assigned sections.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading classes...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : classes.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
                <p>No classes have been created yet.</p>
                <p className="text-sm">Use the "Add New Class" button to create the first one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead>No. of Students</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.section}</TableCell>
                    <TableCell>{cls.teacher}</TableCell>
                    <TableCell>{cls.studentCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit Class</DropdownMenuItem>
                          <DropdownMenuItem>View Students</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete Class</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
