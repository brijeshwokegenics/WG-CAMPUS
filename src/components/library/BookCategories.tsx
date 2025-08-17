
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { getBookCategories, createBookCategory, updateBookCategory, deleteBookCategory } from '@/app/actions/library';

type Category = { id: string; name: string; description?: string };

const CategoryFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
});
type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

export function BookCategories({ schoolId }: { schoolId: string }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchCategories = async () => {
        setLoading(true);
        const result = await getBookCategories(schoolId);
        setCategories(result as Category[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, [schoolId]);

    const handleFormSuccess = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        fetchCategories();
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this category? This may affect existing books.')) {
            startTransition(() => {
                deleteBookCategory(id, schoolId).then(fetchCategories);
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Book Categories</CardTitle>
                        <CardDescription>Manage book genres and classifications.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : categories.length > 0 ? categories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell>{cat.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">No categories created yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CategoryFormDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                schoolId={schoolId}
                editingCategory={editingCategory}
                onSuccess={handleFormSuccess}
            />
        </Card>
    );
}

// Dialog sub-component for the form
interface CategoryFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    schoolId: string;
    editingCategory: Category | null;
    onSuccess: () => void;
}

function CategoryFormDialog({ isOpen, setIsOpen, schoolId, editingCategory, onSuccess }: CategoryFormDialogProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CategoryFormValues>({
        resolver: zodResolver(CategoryFormSchema),
    });
    
    useEffect(() => {
        if (isOpen) {
            reset(editingCategory || { name: '', description: '' });
        }
    }, [isOpen, editingCategory, reset]);

    const action = editingCategory ? updateBookCategory : createBookCategory;
    const [state, formAction] = useFormState(action, { success: false, error: null });
    
    useEffect(() => {
        if(state.success) onSuccess();
    }, [state, onSuccess]);

    const onFormSubmit = (data: CategoryFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingCategory) formData.append('id', editingCategory.id);
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea {...register('description')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
