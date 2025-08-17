'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createUnit } from '@/app/actions/inventory';

const FormSchema = z.object({
  name: z.string().min(1, "Unit name is required (e.g., pcs, box, kg)."),
});
type FormValues = z.infer<typeof FormSchema>;

export function UnitDialog({ isOpen, setIsOpen, schoolId, onSuccess }: any) {
    const [state, formAction] = useFormState(createUnit, { success: false });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
    });

    useEffect(() => {
        if (state.success) {
            onSuccess();
            setIsOpen(false);
            reset();
        }
    }, [state.success, onSuccess, setIsOpen, reset]);
    
    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('schoolId', schoolId);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Unit</DialogTitle>
                     <DialogDescription>e.g., pieces, boxes, sets, kg, etc.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Unit Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Unit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
