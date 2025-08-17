
'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal, Loader2 } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getClassesForSchool, deleteClass } from '@/app/actions/academics';
import { ClassForm } from '@/components/ClassForm';

type ClassData = {
  id: string;
  name: string;
  sections: string[];
};

export default function ClassesPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    const result = await getClassesForSchool(schoolId);
    if (result.success && result.data) {
      // Sort classes alphanumerically on the client, as Firestore might not support it perfectly by default
      const sortedClasses = result.data.sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      setClasses(sortedClasses);
    } else {
      console.error(result.error);
      // Optionally, show a toast notification for the error
    }
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchClasses(); // Re-fetch data to show the new/updated class
  };

  const handleAddNew = () => {
    setEditingClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData);
    setIsDialogOpen(true);
  };

  const handleDelete = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      startDeleteTransition(async () => {
        await deleteClass({ classId, schoolId });
        fetchClasses(); // Re-fetch data
      });
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes & Sections</h1>
          <p className="text-muted-foreground">Manage academic classes and their respective sections.</p>
        </div>
        <Button onClick={handleAddNew} className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class List</CardTitle>
          <CardDescription>A list of all classes configured for this school.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : classes.length > 0 ? (
                classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.sections.join(', ')}</TableCell>
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
                             <DropdownMenuItem onClick={() => handleEdit(cls)}>
                                Edit
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(cls.id)} className="text-destructive">
                                Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No classes found. Add your first class to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
            <DialogDescription>
              {editingClass ? 'Update the details for this class.' : 'Fill in the form to create a new class.'}
            </DialogDescription>
          </DialogHeader>
          <ClassForm
            schoolId={schoolId}
            onSuccess={handleFormSuccess}
            classData={editingClass}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
