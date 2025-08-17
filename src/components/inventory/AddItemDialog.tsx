'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createInventoryItem, getUnits, getLocations } from '@/app/actions/inventory';

const FormSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    categoryId: z.string().min(1, "Category is required."),
    sku: z.string().optional(),
    unitId: z.string().min(1, "Unit is required"),
    locationId: z.string().min(1, "Location is required"),
    reorderLevel: z.coerce.number().min(0).default(0),
});
type FormValues = z.infer<typeof FormSchema>;

export function AddItemDialog({ isOpen, setIsOpen, schoolId, categories, onSuccess }: any) {
    const [units, setUnits] = useState([]);
    const [locations, setLocations] = useState([]);

    const [state, formAction] = useFormState(createInventoryItem, { success: false });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
    });

    useEffect(() => {
        async function fetchMasters() {
            const [unitsRes, locsRes] = await Promise.all([getUnits(schoolId), getLocations(schoolId)]);
            setUnits(unitsRes as any);
            setLocations(locsRes as any);
        }
        if(isOpen) fetchMasters();
    }, [isOpen, schoolId]);

    useEffect(() => {
        if (state.success) {
            onSuccess();
            setIsOpen(false);
            reset();
        }
    }, [state.success, onSuccess, setIsOpen, reset]);
    
    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
        formData.append('schoolId', schoolId);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Controller name="categoryId" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger><SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                            )} />
                            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unitId">Unit of Measure</Label>
                            <Controller name="unitId" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger><SelectContent>{units.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select>
                            )} />
                             {errors.unitId && <p className="text-sm text-destructive">{errors.unitId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="locationId">Storage Location</Label>
                            <Controller name="locationId" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select location..." /></SelectTrigger><SelectContent>{locations.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
                            )} />
                            {errors.locationId && <p className="text-sm text-destructive">{errors.locationId.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU (Optional)</Label>
                            <Input id="sku" {...register('sku')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reorderLevel">Reorder Level</Label>
                            <Input id="reorderLevel" type="number" {...register('reorderLevel')} />
                        </div>
                    </div>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
