
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PlusCircle, Trash2, Loader2, Warehouse, Layers, PlusMinus, History } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

import { 
    createItemCategory, 
    deleteItemCategory,
    getItemCategories,
    getInventoryItems
} from '@/app/actions/inventory';

import { AddItemDialog } from './inventory/AddItemDialog';
import { UpdateStockDialog } from './inventory/UpdateStockDialog';
import { ItemHistoryDialog } from './inventory/ItemHistoryDialog';


// ========== TYPE DEFINITIONS & SCHEMAS ==========

export type Category = { id: string; name: string };
export type Item = { id: string; name: string; categoryId: string; categoryName: string; quantity: number; reorderLevel?: number };
export type HistoryEntry = { id: string; date: Date; type: 'in' | 'out'; quantity: number; notes: string };

const CategorySchema = z.object({
  name: z.string().min(2, "Category name is required."),
});
type CategoryFormValues = z.infer<typeof CategorySchema>;

// ========== MANAGER COMPONENTS ==========

function CategoryManager({ schoolId, categories, onUpdate }: { schoolId: string, categories: Category[], onUpdate: () => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CategoryFormValues>({ resolver: zodResolver(CategorySchema) });
    const [state, formAction] = useFormState(createItemCategory, { success: false });

    useEffect(() => {
        if(state.success) {
            reset({ name: '' });
            setIsDialogOpen(false);
            onUpdate();
        }
    }, [state.success, reset, onUpdate]);

    const onFormSubmit = (data: CategoryFormValues) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('schoolId', schoolId);
        formAction(formData);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure? Deleting a category will not delete its items, but they will become uncategorized.')) {
            await deleteItemCategory(id, schoolId);
            onUpdate();
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Categories</CardTitle>
                        <CardDescription>Add or remove inventory categories.</CardDescription>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Category Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {categories.length > 0 ? categories.map(cat => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">{cat.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={2} className="h-24 text-center">No categories created.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                        <div className="space-y-2">
                            <Label htmlFor="category-name">Category Name</Label>
                            <Input id="category-name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Add</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function ItemManager({ schoolId, items, categories, onUpdate }: { schoolId: string, items: Item[], categories: Category[], onUpdate: () => void }) {
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const handleOpenStockModal = (item: Item) => {
        setSelectedItem(item);
        setIsStockModalOpen(true);
    }
     const handleOpenHistoryModal = (item: Item) => {
        setSelectedItem(item);
        setIsHistoryModalOpen(true);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>All Items</CardTitle>
                        <CardDescription>View and manage all inventory items.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAddItemOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add New Item</Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Quantity in Stock</TableHead>
                            <TableHead>Reorder Level</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length > 0 ? items.map(item => (
                            <TableRow key={item.id} className={item.reorderLevel && item.quantity <= item.reorderLevel ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.categoryName}</TableCell>
                                <TableCell className="font-bold">{item.quantity}</TableCell>
                                <TableCell>{item.reorderLevel ?? 'Not Set'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                     <Button variant="outline" size="sm" onClick={() => handleOpenHistoryModal(item)}><History className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={() => handleOpenStockModal(item)}><PlusMinus className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={5} className="h-24 text-center">No items created.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
            <AddItemDialog isOpen={isAddItemOpen} setIsOpen={setIsAddItemOpen} schoolId={schoolId} categories={categories} onSuccess={onUpdate} />
            {selectedItem && <UpdateStockDialog isOpen={isStockModalOpen} setIsOpen={setIsStockModalOpen} item={selectedItem} schoolId={schoolId} onSuccess={onUpdate} />}
            {selectedItem && <ItemHistoryDialog isOpen={isHistoryModalOpen} setIsOpen={setIsHistoryModalOpen} item={selectedItem} schoolId={schoolId} />}
        </Card>
    );
}

// ========== MAIN COMPONENT ==========

interface InventoryManagerProps {
  schoolId: string;
  initialCategories: Category[];
  initialItems: Item[];
}

export function InventoryManager({ schoolId, initialCategories, initialItems }: InventoryManagerProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState(initialCategories);
    const [items, setItems] = useState(initialItems);

    const fetchData = async () => {
        setLoading(true);
        const [catRes, itemRes] = await Promise.all([
            getItemCategories(schoolId),
            getInventoryItems(schoolId)
        ]);
        if (catRes.success && catRes.data) setCategories(catRes.data as Category[]);
        if (itemRes.success && itemRes.data) setItems(itemRes.data as Item[]);
        setLoading(false);
    }
    
    return (
        <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inventory"><Warehouse className="mr-2 h-4 w-4" /> Inventory</TabsTrigger>
                <TabsTrigger value="categories"><Layers className="mr-2 h-4 w-4" /> Manage Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
                {loading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : 
                <ItemManager schoolId={schoolId} items={items} categories={categories} onUpdate={fetchData} />}
            </TabsContent>
            <TabsContent value="categories">
                 {loading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : 
                 <CategoryManager schoolId={schoolId} categories={categories} onUpdate={fetchData} />}
            </TabsContent>
        </Tabs>
    );
}
