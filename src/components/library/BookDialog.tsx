
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
import { addBook, updateBook } from '@/app/actions/library';

const FormSchema = z.object({
    title: z.string().min(3, "Title is required."),
    author: z.string().min(3, "Author is required."),
    publisher: z.string().optional(),
    isbn: z.string().optional(),
    categoryId: z.string().min(1, "Category is required."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    availableStock: z.coerce.number().min(0),
    shelfNumber: z.string().optional(),
    publishedYear: z.coerce.number().optional(),
}).refine(data => data.availableStock <= data.quantity, {
    message: "Available stock cannot be greater than total quantity.",
    path: ["availableStock"],
});

type FormValues = z.infer<typeof FormSchema>;

export function BookDialog({ isOpen, setIsOpen, schoolId, categories, editingBook, onSuccess }: any) {
    const action = editingBook ? updateBook : addBook;
    const [state, formAction] = useFormState(action, { success: false, error: null });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
    });

    useEffect(() => {
        if (isOpen) {
            const defaultValues = editingBook || {
                title: '',
                author: '',
                publisher: '',
                isbn: '',
                categoryId: '',
                quantity: 1,
                availableStock: 1,
                shelfNumber: '',
                publishedYear: new Date().getFullYear(),
            };
            reset(defaultValues);
        }
    }, [isOpen, editingBook, reset]);

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingBook) {
            formData.append('id', editingBook.id);
        } else {
            // For new books, available stock is same as total quantity
            data.availableStock = data.quantity;
        }

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                 formData.append(key, String(value));
            }
        });
        
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-6 pl-2">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="title">Book Title</Label>
                            <Input id="title" {...register('title')} />
                            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input id="author" {...register('author')} />
                             {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publisher">Publisher</Label>
                            <Input id="publisher" {...register('publisher')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="isbn">ISBN</Label>
                            <Input id="isbn" {...register('isbn')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Controller name="categoryId" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger><SelectContent>{categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                            )} />
                            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Total Quantity</Label>
                            <Input id="quantity" type="number" {...register('quantity')} />
                            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                        </div>
                        {editingBook && (
                             <div className="space-y-2">
                                <Label htmlFor="availableStock">Available Stock</Label>
                                <Input id="availableStock" type="number" {...register('availableStock')} />
                                {errors.availableStock && <p className="text-sm text-destructive">{errors.availableStock.message}</p>}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="shelfNumber">Shelf / Rack Number</Label>
                            <Input id="shelfNumber" {...register('shelfNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publishedYear">Published Year</Label>
                            <Input id="publishedYear" type="number" {...register('publishedYear')} />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {editingBook ? 'Save Changes' : 'Add Book'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
