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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createItemCategory, updateItemCategory } from '@/app/actions/inventory';

const FormSchema = z.object({
  name: z.string().min(3, "Category name is required."),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof FormSchema>;

export function CategoryDialog({ isOpen, setIsOpen, schoolId, editingCategory, onSuccess }: any) {
    const action = editingCategory ? updateItemCategory : createItemCategory;
    const [state, formAction] = useFormState(action, { success: false });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: editingCategory || { name: '', description: '' },
    });

    useEffect(() => {
        if (state.success) {
            onSuccess();
            setIsOpen(false);
        }
    }, [state.success, onSuccess, setIsOpen]);

    useEffect(() => {
        reset(editingCategory || { name: '', description: '' });
    }, [editingCategory, reset, isOpen]);

    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('schoolId', schoolId);
        if (editingCategory) {
            formData.append('id', editingCategory.id);
        }
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" {...register('description')} />
                    </div>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
