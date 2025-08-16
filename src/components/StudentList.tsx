
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { deleteStudent, getStudentsForSchool } from '@/app/actions/academics';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export function StudentList({ schoolId, query }: { schoolId: string, query: string }) {
    const [students, setStudents] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        async function fetchStudents() {
            const studentData = await getStudentsForSchool(schoolId, query);
            setStudents(studentData);
        }
        fetchStudents();
    }, [schoolId, query]);

    const handleDelete = (studentId: string) => {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            startTransition(async () => {
                await deleteStudent({ studentId, schoolId });
                // Refresh data
                const studentData = await getStudentsForSchool(schoolId, query);
                setStudents(studentData);
            });
        }
    };


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admission ID</TableHead>
          <TableHead>Student Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Father's Name</TableHead>
          <TableHead>Mobile Number</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length > 0 ? (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-mono text-xs">{student.id}</TableCell>
              <TableCell className="font-medium">{student.studentName}</TableCell>
              <TableCell>{student.className} - {student.section}</TableCell>
              <TableCell>{student.fatherName}</TableCell>
              <TableCell>{student.parentMobile}</TableCell>
              <TableCell className="text-right">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                       <Link href={`/director/dashboard/${schoolId}/academics/students/${student.id}`} passHref>
                          <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                          </DropdownMenuItem>
                       </Link>
                       <Link href={`/director/dashboard/${schoolId}/academics/students/edit/${student.id}`} passHref>
                           <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Student
                           </DropdownMenuItem>
                       </Link>
                       <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(student.id)} disabled={isPending}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
              No students found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
