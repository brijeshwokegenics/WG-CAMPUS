
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Loader2, Edit, Trash2, History, PackagePlus, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getInventoryItems, getItemCategories } from '@/app/actions/inventory';
import { AddItemDialog } from './AddItemDialog';
import { UpdateStockDialog } from './UpdateStockDialog';
import { ItemHistoryDialog } from './ItemHistoryDialog';

type Item = { id: string, name: string, categoryId: string, sku?: string, unitId: string, locationId: string, reorderLevel: number, currentStock: number };
type Category = { id: string, name: string };

export function ItemManager({ schoolId }: { schoolId: string }) {
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategory, setFilteredCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const fetchData = () => {
        setLoading(true);
        startTransition(async () => {
            const [itemsRes, categoriesRes] = await Promise.all([
                getInventoryItems(schoolId, filteredCategory || undefined),
                getItemCategories(schoolId)
            ]);
            setItems(itemsRes as Item[]);
            setCategories(categoriesRes as Category[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, [schoolId, filteredCategory]);
    
    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'N/A';
    }

    const handleUpdateStock = (item: Item) => {
        setSelectedItem(item);
        setIsUpdateStockOpen(true);
    }
    
    const handleHistory = (item: Item) => {
        setSelectedItem(item);
        setIsHistoryOpen(true);
    }
    
    // Add other handlers for edit/delete if needed

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Inventory Items</CardTitle>
                        <CardDescription>View, add, and manage all inventory items.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <div className="flex items-center gap-2">
                             <Select value={filteredCategory} onValueChange={setFilteredCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {filteredCategory && (
                                <Button variant="ghost" size="icon" onClick={() => setFilteredCategory('')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                         </div>
                        <Button onClick={() => setIsAddItemOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Current Stock</TableHead>
                                <TableHead>Reorder Level</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : items.length > 0 ? (
                                items.map(item => (
                                    <TableRow key={item.id} className={item.currentStock <= item.reorderLevel ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                                        <TableCell className="font-bold">{item.currentStock}</TableCell>
                                        <TableCell>{item.reorderLevel}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item)}><PackagePlus className="mr-2 h-4 w-4"/> Update Stock</Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 ml-2"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleHistory(item)}><History className="mr-2 h-4 w-4"/> View History</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/> Edit Item</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete Item</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">No items found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {isAddItemOpen && <AddItemDialog isOpen={isAddItemOpen} setIsOpen={setIsAddItemOpen} schoolId={schoolId} categories={categories} onSuccess={fetchData} />}
                {isUpdateStockOpen && selectedItem && <UpdateStockDialog isOpen={isUpdateStockOpen} setIsOpen={setIsUpdateStockOpen} item={selectedItem} schoolId={schoolId} onSuccess={fetchData} />}
                {isHistoryOpen && selectedItem && <ItemHistoryDialog isOpen={isHistoryOpen} setIsOpen={setIsHistoryOpen} item={selectedItem} schoolId={schoolId} />}
            </CardContent>
        </Card>
    );
}
