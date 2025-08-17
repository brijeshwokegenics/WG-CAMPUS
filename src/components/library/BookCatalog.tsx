
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MoreHorizontal, Loader2, Edit, Trash2, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBooks, deleteBook, getBookCategories } from '@/app/actions/library';
import { BookDialog } from './BookDialog';

type Book = { 
    id: string; 
    title: string; 
    author: string; 
    categoryId: string; 
    quantity: number; 
    availableStock: number;
    isbn?: string;
};
type Category = { id: string; name: string };

export function BookCatalog({ schoolId }: { schoolId: string }) {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategory, setFilteredCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);

    const fetchData = () => {
        setLoading(true);
        startTransition(async () => {
            const [booksRes, categoriesRes] = await Promise.all([
                getBooks(schoolId, filteredCategory || undefined),
                getBookCategories(schoolId)
            ]);
            setBooks(booksRes as Book[]);
            setCategories(categoriesRes as Category[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, [schoolId, filteredCategory]);

    const handleFormSuccess = () => {
        setIsBookDialogOpen(false);
        setEditingBook(null);
        fetchData();
    };

    const handleAddClick = () => {
        setEditingBook(null);
        setIsBookDialogOpen(true);
    };

    const handleEditClick = (book: Book) => {
        setEditingBook(book);
        setIsBookDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        if(confirm('Are you sure you want to delete this book?')) {
            startTransition(() => deleteBook(id, schoolId).then(fetchData));
        }
    };
    
    const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'N/A';

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.isbn && book.isbn.includes(searchTerm))
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle>Book Catalog</CardTitle>
                        <CardDescription>View, add, and manage all books in the library.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Search by title, author, ISBN..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-64"
                        />
                        <div className="flex items-center">
                            <Select value={filteredCategory} onValueChange={setFilteredCategory}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {filteredCategory && (
                                <Button variant="ghost" size="icon" className="ml-1" onClick={() => setFilteredCategory('')}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" /> Add Book</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>ISBN</TableHead>
                                <TableHead>Stock (Avail/Total)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : filteredBooks.length > 0 ? (
                                filteredBooks.map(book => (
                                    <TableRow key={book.id}>
                                        <TableCell className="font-medium">{book.title}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{getCategoryName(book.categoryId)}</TableCell>
                                        <TableCell>{book.isbn}</TableCell>
                                        <TableCell className="font-semibold">{book.availableStock} / {book.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditClick(book)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(book.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">No books found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {isBookDialogOpen && <BookDialog isOpen={isBookDialogOpen} setIsOpen={setIsBookDialogOpen} schoolId={schoolId} categories={categories} editingBook={editingBook} onSuccess={handleFormSuccess} />}
            </CardContent>
        </Card>
    );
}
