

'use client';

import React, { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye, Loader2 } from "lucide-react"
import { deleteStudent, getStudentsForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from './ui/skeleton';

type StudentListProps = {
    schoolId: string;
    name?: string;
    admissionId?: string;
    classId?: string;
    section?: string;
}

export function StudentList({ schoolId, name, admissionId, classId, section }: StudentListProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [isDeleting, startDeleteTransition] = useTransition();
    const [isLoading, startLoadingTransition] = useTransition();

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchStudents = useCallback(() => {
        startLoadingTransition(async () => {
            const result = await getStudentsForSchool({ schoolId, searchTerm: name, admissionId, classId, section, page: currentPage, rowsPerPage });
            if(result.success) {
                setStudents(result.students);
                setTotalStudents(result.total);
            } else {
                setStudents([]);
                setTotalStudents(0);
            }
        });
    }, [schoolId, name, admissionId, classId, section, currentPage, rowsPerPage]);


    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [name, admissionId, classId, section, rowsPerPage])

    const handleDelete = (studentId: string) => {
        if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            startDeleteTransition(async () => {
                await deleteStudent({ studentId, schoolId });
                fetchStudents(); // Refresh data
            });
        }
    };
    
    const totalPages = Math.ceil(totalStudents / rowsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

  return (
    <div>
        <div className="overflow-x-auto border rounded-lg">
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
                {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                ) : students.length > 0 ? (
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
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
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
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(student.id)} disabled={isDeleting}>
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
                    No students found for the current filters.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * rowsPerPage + 1, totalStudents)} to {Math.min(currentPage * rowsPerPage, totalStudents)} of {totalStudents} students
            </div>
             <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                    value={`${rowsPerPage}`}
                    onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={`${rowsPerPage}`} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
  );
}
