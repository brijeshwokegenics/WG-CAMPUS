
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { createFeeHead, updateFeeHead, deleteFeeHead, getFeeHeads } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

type FeeHead = { id: string; name: string; description?: string; type: "One-time" | "Annual" | "Monthly" | "Quarterly"; };

const FeeHeadFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    description: z.string().optional(),
    type: z.enum(["One-time", "Annual", "Monthly", "Quarterly"]),
});
type FeeHeadFormValues = z.infer<typeof FeeHeadFormSchema>;

interface FeeHeadManagerProps {
    schoolId: string;
    initialFeeHeads: FeeHead[];
    onFeeHeadsUpdate: (feeHeads: FeeHead[]) => void;
}

export function FeeHeadManager({ schoolId, initialFeeHeads, onFeeHeadsUpdate }: FeeHeadManagerProps) {
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>(initialFeeHeads);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFeeHead, setEditingFeeHead] = useState<FeeHead | null>(null);

    const fetchFeeHeads = async () => {
        const result = await getFeeHeads(schoolId);
        if (result.success && result.data) {
            setFeeHeads(result.data as FeeHead[]);
            onFeeHeadsUpdate(result.data as FeeHead[]);
        }
    };

    const handleFormSuccess = () => {
        setIsDialogOpen(false);
        setEditingFeeHead(null);
        fetchFeeHeads();
    };

    const handleAddNew = () => {
        setEditingFeeHead(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (feeHead: FeeHead) => {
        setEditingFeeHead(feeHead);
        setIsDialogOpen(true);
    };
    
    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this fee head? This may affect existing fee structures.')) {
            await deleteFeeHead({ id, schoolId });
            fetchFeeHeads();
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Fee Heads</CardTitle>
                        <CardDescription>Create and manage reusable fee components.</CardDescription>
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
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeHeads.length > 0 ? feeHeads.map(head => (
                                <TableRow key={head.id}>
                                    <TableCell className="font-medium">{head.name}</TableCell>
                                    <TableCell>{head.type}</TableCell>
                                    <TableCell>{head.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(head)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(head.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No fee heads created yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <FeeHeadFormDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                schoolId={schoolId}
                editingFeeHead={editingFeeHead}
                onSuccess={handleFormSuccess}
            />
        </Card>
    );
}

// Dialog sub-component for the form
interface FeeHeadFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    schoolId: string;
    editingFeeHead: FeeHead | null;
    onSuccess: () => void;
}

function FeeHeadFormDialog({ isOpen, setIsOpen, schoolId, editingFeeHead, onSuccess }: FeeHeadFormDialogProps) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FeeHeadFormValues>({
        resolver: zodResolver(FeeHeadFormSchema),
        defaultValues: editingFeeHead || { name: '', description: '', type: 'Monthly' }
    });
    
    useEffect(() => {
        if (isOpen) {
            reset(editingFeeHead || { name: '', description: '', type: 'Monthly' });
        }
    }, [isOpen, editingFeeHead, reset]);

    const action = editingFeeHead ? updateFeeHead : createFeeHead;
    const [state, formAction] = useFormState(action, { success: false, error: null });
    
    useEffect(() => {
        if(state.success) {
            onSuccess();
        }
    }, [state, onSuccess]);

    const onFormSubmit = (data: FeeHeadFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingFeeHead) {
            formData.append('id', editingFeeHead.id);
        }
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('type', data.type);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingFeeHead ? 'Edit Fee Head' : 'Create New Fee Head'}</DialogTitle>
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
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select fee type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="One-time">One-time</SelectItem>
                                        <SelectItem value="Annual">Annual</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
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
