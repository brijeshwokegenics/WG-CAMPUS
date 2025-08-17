'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createVendor, updateVendor } from '@/app/actions/inventory';

const FormSchema = z.object({
  name: z.string().min(3, "Vendor name is required."),
  contactPerson: z.string().optional(),
  phone: z.string().min(10, "Phone number is required."),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof FormSchema>;

export function VendorDialog({ isOpen, setIsOpen, schoolId, editingVendor, onSuccess }: any) {
    const action = editingVendor ? updateVendor : createVendor;
    const [state, formAction] = useFormState(action, { success: false });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: editingVendor || {},
    });

    useEffect(() => {
        if (state.success) {
            onSuccess();
            setIsOpen(false);
        }
    }, [state.success, onSuccess, setIsOpen]);

    useEffect(() => {
        reset(editingVendor || {});
    }, [editingVendor, reset, isOpen]);

    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
        formData.append('schoolId', schoolId);
        if (editingVendor) formData.append('id', editingVendor.id);
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Vendor Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contactPerson">Contact Person</Label>
                            <Input id="contactPerson" {...register('contactPerson')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" {...register('phone')} />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" {...register('address')} />
                    </div>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Vendor
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
