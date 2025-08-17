
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createHostel, updateHostel } from '@/app/actions/hostel';

const HostelSchema = z.object({
  name: z.string().min(3, "Hostel name is required."),
  type: z.enum(['Boys', 'Girls', 'Mixed']),
  warden: z.string().optional(),
});
type FormValues = z.infer<typeof HostelSchema>;

export function HostelDialog({ isOpen, setIsOpen, schoolId, editingHostel, onSuccess }: any) {
    const action = editingHostel ? updateHostel : createHostel;
    const [state, formAction] = useFormState(action, { success: false, error: null });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(HostelSchema),
    });

    useEffect(() => {
        if (isOpen) {
            reset(editingHostel || { name: '', type: 'Boys', warden: ''});
        }
    }, [isOpen, editingHostel, reset]);

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingHostel) formData.append('id', editingHostel.id);
        Object.entries(data).forEach(([key, value]) => formData.append(key, value || ''));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingHostel ? 'Edit Hostel' : 'Create New Hostel'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="space-y-2">
                        <Label htmlFor="name">Hostel Name</Label>
                        <Input id="name" {...register('name')} placeholder="e.g., Ganga House" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Hostel For</Label>
                             <Controller name="type" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Boys">Boys</SelectItem><SelectItem value="Girls">Girls</SelectItem><SelectItem value="Mixed">Mixed</SelectItem></SelectContent></Select>
                            )} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="warden">Warden Name</Label>
                            <Input id="warden" {...register('warden')} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {editingHostel ? 'Save Changes' : 'Create Hostel'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
