
'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';

import * as actions from '@/app/actions/expenses';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = { id: string; name: string; description?: string };
type Expense = { id: string; expenseCategoryId: string; amount: number; date: Date; description: string; vendor?: string; invoiceNumber?: string; };

export function ExpenseManager({ schoolId }: { schoolId: string }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const fetchCategories = useCallback(async () => {
        setLoadingCategories(true);
        const res = await actions.getExpenseCategories(schoolId);
        if (res.success) setCategories(res.data as Category[]);
        setLoadingCategories(false);
    }, [schoolId]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expenses">Record Expenses</TabsTrigger>
                <TabsTrigger value="categories">Manage Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses">
                <ExpenseList schoolId={schoolId} categories={categories} loadingCategories={loadingCategories} />
            </TabsContent>
            <TabsContent value="categories">
                <ExpenseCategoryManager schoolId={schoolId} initialCategories={categories} onUpdate={fetchCategories} loading={loadingCategories} />
            </TabsContent>
        </Tabs>
    );
}

// Expense List & Form Component
function ExpenseList({ schoolId, categories, loadingCategories }: { schoolId: string; categories: Category[], loadingCategories: boolean }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    const [filteredCategory, setFilteredCategory] = useState('');

    const fetchExpenses = useCallback(async () => {
        setLoadingExpenses(true);
        const res = await actions.getExpenses(schoolId, filteredCategory || undefined);
        if (res.success) setExpenses(res.data as Expense[]);
        setLoadingExpenses(false);
    }, [schoolId, filteredCategory]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <AddExpenseForm schoolId={schoolId} categories={categories} onSuccess={fetchExpenses} />
            </div>
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Expense History</CardTitle>
                        <CardDescription>A log of all recorded expenditures.</CardDescription>
                         <div className="pt-2">
                            <Label>Filter by Category</Label>
                            <Select value={filteredCategory} onValueChange={setFilteredCategory}>
                                <SelectTrigger><SelectValue placeholder="All Categories"/></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {loadingExpenses ? <TableRow><TableCell colSpan={4}><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
                                : expenses.length > 0 ? expenses.map(exp => (
                                    <TableRow key={exp.id}>
                                        <TableCell>{format(exp.date, 'dd-MMM-yy')}</TableCell>
                                        <TableCell>{getCategoryName(exp.expenseCategoryId)}</TableCell>
                                        <TableCell className="font-semibold">{exp.amount.toLocaleString('en-IN')}</TableCell>
                                        <TableCell>{exp.description}</TableCell>
                                    </TableRow>
                                ))
                                : <TableRow><TableCell colSpan={4} className="h-24 text-center">No expenses recorded yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const AddExpenseFormSchema = z.object({
  expenseCategoryId: z.string().min(1, "Please select a category."),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero."),
  date: z.date(),
  description: z.string().min(3, "Description is required."),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
});
type AddExpenseFormValues = z.infer<typeof AddExpenseFormSchema>;

function AddExpenseForm({ schoolId, categories, onSuccess }: { schoolId: string, categories: Category[], onSuccess: () => void }) {
    const [state, formAction] = useFormState(actions.createExpense, { success: false });
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<AddExpenseFormValues>({
        resolver: zodResolver(AddExpenseFormSchema),
        defaultValues: { date: new Date() }
    });

    useEffect(() => {
        if(state.success) {
            reset({ expenseCategoryId: '', amount: 0, date: new Date(), description: '', vendor: '', invoiceNumber: '' });
            onSuccess();
        }
    }, [state.success, reset, onSuccess]);

    return (
        <Card>
            <CardHeader><CardTitle>Add New Expense</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(data => formAction(data as any))} className="space-y-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    {state.success && <Alert className="border-green-500 text-green-700"><AlertDescription>{state.message}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Controller name="expenseCategoryId" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select a category..."/></SelectTrigger><SelectContent>{categories.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                        )} />
                        {errors.expenseCategoryId && <p className="text-sm text-destructive">{errors.expenseCategoryId.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input type="number" {...register('amount')} />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label>Date</Label>
                            <Controller name="date" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, 'PPP') : ''}</Button></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover>)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea {...register('description')}/>
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Vendor (Optional)</Label>
                            <Input {...register('vendor')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice # (Optional)</Label>
                            <Input {...register('invoiceNumber')} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Add Expense
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

// Category Management Component
function ExpenseCategoryManager({ schoolId, initialCategories, onUpdate, loading }: { schoolId: string, initialCategories: Category[], onUpdate: () => void, loading: boolean }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleAddNew = () => { setEditingCategory(null); setIsDialogOpen(true); };
    const handleEdit = (cat: Category) => { setEditingCategory(cat); setIsDialogOpen(true); };
    const handleDelete = (id: string) => {
        if(confirm('Are you sure? Deleting a category will not delete its expenses, but it will be un-categorized.')) {
            startTransition(() => actions.deleteExpenseCategory(id, schoolId).then(onUpdate));
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Expense Categories</CardTitle>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={3}><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
                            : initialCategories.length > 0 ? initialCategories.map(cat => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    <TableCell>{cat.description}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={3} className="h-24 text-center">No categories created.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
                <CategoryFormDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} schoolId={schoolId} editingCategory={editingCategory} onSuccess={onUpdate} />
            </CardContent>
        </Card>
    );
}

const CategoryFormSchema = z.object({
  name: z.string().min(3, "Name is required."),
  description: z.string().optional(),
});
type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

function CategoryFormDialog({ isOpen, setIsOpen, schoolId, editingCategory, onSuccess }: any) {
    const action = editingCategory ? actions.updateExpenseCategory : actions.createExpenseCategory;
    const [state, formAction] = useFormState(action, { success: false });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CategoryFormValues>({
        resolver: zodResolver(CategoryFormSchema),
    });

    useEffect(() => {
        if (isOpen) reset(editingCategory || { name: '', description: '' });
    }, [isOpen, editingCategory, reset]);

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: CategoryFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingCategory) formData.append('id', editingCategory.id);
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{editingCategory ? 'Edit' : 'Create'} Expense Category</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea {...register('description')} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
