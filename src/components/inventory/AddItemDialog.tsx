
'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createInventoryItem } from '@/app/actions/inventory';
import { type Category } from '@/components/InventoryManager';

const ItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  categoryId: z.string().min(1, "Please select a category."),
  reorderLevel: z.coerce.number().min(0).optional(),
});
type ItemFormValues = z.infer<typeof ItemSchema>;

interface AddItemDialogProps {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    schoolId: string;
    categories: Category[];
    onSuccess: () => void;
}

export const AddItemDialog = ({ isOpen, setIsOpen, schoolId, categories, onSuccess }: AddItemDialogProps) => {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ItemFormValues>({ resolver: zodResolver(ItemSchema) });
    const [state, formAction] = useFormState(createInventoryItem, { success: false });

    useEffect(() => {
        if(state.success) {
            reset();
            setIsOpen(false);
            onSuccess();
        }
    }, [state.success, reset, onSuccess, setIsOpen]);

    const onFormSubmit = (data: ItemFormValues) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('categoryId', data.categoryId);
        if(data.reorderLevel) formData.append('reorderLevel', String(data.reorderLevel));
        formData.append('schoolId', schoolId);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Inventory Item</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Controller name="categoryId" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        )} />
                        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Reorder Level (Optional)</Label>
                        <Input type="number" {...register('reorderLevel')} placeholder="e.g., 10" />
                        <p className='text-xs text-muted-foreground'>Get a warning when stock falls to this level.</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Create Item</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
