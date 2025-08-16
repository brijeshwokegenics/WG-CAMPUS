
'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateStock } from '@/app/actions/inventory';
import { type Item } from '@/components/InventoryManager';

const StockUpdateSchema = z.object({
    type: z.enum(['in', 'out']),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    notes: z.string().optional(),
});
type StockUpdateFormValues = z.infer<typeof StockUpdateSchema>;

interface UpdateStockDialogProps {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    item: Item;
    schoolId: string;
    onSuccess: () => void;
}

export const UpdateStockDialog = ({ isOpen, setIsOpen, item, schoolId, onSuccess }: UpdateStockDialogProps) => {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<StockUpdateFormValues>({ 
        resolver: zodResolver(StockUpdateSchema),
        defaultValues: { type: 'in' }
    });
    const [state, formAction] = useFormState(updateStock, { success: false });

    useEffect(() => {
        if(state.success) {
            reset();
            setIsOpen(false);
            onSuccess();
        }
    }, [state.success, reset, onSuccess, setIsOpen]);

    const onFormSubmit = (data: StockUpdateFormValues) => {
        const formData = new FormData();
        formData.append('itemId', item.id);
        formData.append('schoolId', schoolId);
        formData.append('type', data.type);
        formData.append('quantity', String(data.quantity));
        if(data.notes) formData.append('notes', data.notes);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Stock for: {item.name}</DialogTitle>
                    <DialogDescription>Current quantity: {item.quantity}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label>Action</Label>
                        <Controller name="type" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select an action" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="in">Add Stock (Receive)</SelectItem>
                                    <SelectItem value="out">Issue Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                    </div>
                    <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" {...register('quantity')} />
                        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea {...register('notes')} placeholder="e.g., Issued to Science Dept, Received from Supplier X" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Update Stock</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
