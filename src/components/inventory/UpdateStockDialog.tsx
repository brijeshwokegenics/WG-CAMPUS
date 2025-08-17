'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { updateStock } from '@/app/actions/inventory';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const FormSchema = z.object({
    type: z.enum(['add', 'issue']),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    date: z.date(),
    notes: z.string().optional(),
    issuedTo: z.string().optional(),
}).refine(data => {
    if (data.type === 'issue' && !data.issuedTo) {
        return false;
    }
    return true;
}, { message: "Issued to is required when issuing stock.", path: ["issuedTo"] });

type FormValues = z.infer<typeof FormSchema>;

export function UpdateStockDialog({ isOpen, setIsOpen, schoolId, item, onSuccess }: any) {
    const [state, formAction] = useFormState(updateStock, { success: false });

    const { register, handleSubmit, control, watch, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: { type: 'add', date: new Date() }
    });
    
    const type = watch('type');

    useEffect(() => {
        if (state.success) {
            onSuccess();
            setIsOpen(false);
            reset();
        }
    }, [state.success, onSuccess, setIsOpen, reset]);
    
    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof Date) formData.append(key, value.toISOString());
            else if (value) formData.append(key, String(value));
        });
        formData.append('schoolId', schoolId);
        formData.append('itemId', item.id);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Stock for: {item.name}</DialogTitle>
                    <DialogDescription>Current Stock: {item.currentStock}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                     <div className="space-y-2">
                        <Label>Action</Label>
                        <Controller name="type" control={control} render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="add" id="add"/><Label htmlFor="add">Add Stock</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="issue" id="issue"/><Label htmlFor="issue">Issue Stock</Label></div>
                            </RadioGroup>
                        )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input id="quantity" type="number" {...register('quantity')} />
                            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Controller name="date" control={control} render={({ field }) => (
                                <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                             )} />
                        </div>
                    </div>
                    {type === 'issue' && (
                        <div className="space-y-2">
                            <Label htmlFor="issuedTo">Issued To (Department/Person)</Label>
                            <Input id="issuedTo" {...register('issuedTo')} />
                            {errors.issuedTo && <p className="text-sm text-destructive">{errors.issuedTo.message}</p>}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" {...register('notes')} />
                    </div>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Update Stock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
