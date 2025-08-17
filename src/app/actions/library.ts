
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';


// ========== BOOK CATEGORIES ==========
const BookCategorySchema = z.object({
  name: z.string().min(3, "Category name is required."),
  description: z.string().optional(),
  schoolId: z.string(),
});

export async function createBookCategory(prevState: any, formData: FormData) {
  const parsed = BookCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data' };
  
  try {
    const q = query(collection(db, 'libraryCategories'), where('schoolId', '==', parsed.data.schoolId), where('name', '==', parsed.data.name));
    const existing = await getDocs(q);
    if (!existing.empty) return { success: false, error: `A category named "${parsed.data.name}" already exists.` };

    await addDoc(collection(db, 'libraryCategories'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/library`);
    return { success: true, message: 'Category created.' };
  } catch (e) { return { success: false, error: 'Failed to create category.' }; }
}

export async function getBookCategories(schoolId: string) {
  const q = query(collection(db, 'libraryCategories'), where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  categories.sort((a, b) => a.name.localeCompare(b.name));
  return categories;
}

export async function updateBookCategory(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = BookCategorySchema.omit({schoolId: true}).safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data' };
    
    try {
        const docRef = doc(db, 'libraryCategories', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/library`);
        return { success: true, message: 'Category updated.' };
    } catch (e) { return { success: false, error: 'Failed to update.' }; }
}

export async function deleteBookCategory(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'libraryCategories', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/library`);
        return { success: true };
    } catch(e) {
        return { success: false, error: 'Failed to delete.' };
    }
}


// ========== BOOKS ==========
const BookSchema = z.object({
    schoolId: z.string(),
    title: z.string().min(3, "Title is required."),
    author: z.string().min(3, "Author is required."),
    publisher: z.string().optional(),
    isbn: z.string().optional(),
    categoryId: z.string().min(1, "Category is required."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    availableStock: z.coerce.number().min(0),
    shelfNumber: z.string().optional(),
    publishedYear: z.coerce.number().optional(),
});

const AddBookSchema = BookSchema.extend({}).refine(data => data.availableStock <= data.quantity, {
    message: "Available stock cannot be greater than total quantity.",
    path: ["availableStock"],
});
const UpdateBookSchema = BookSchema.omit({schoolId: true}).extend({id: z.string()}).refine(data => data.availableStock <= data.quantity, {
    message: "Available stock cannot be greater than total quantity.",
    path: ["availableStock"],
});


export async function addBook(prevState: any, formData: FormData) {
    const rawData = {
        ...Object.fromEntries(formData),
        // Set available stock equal to quantity on initial add
        availableStock: formData.get('quantity')
    };
    const parsed = AddBookSchema.safeParse(rawData);
    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: 'Invalid data provided.', details: parsed.error.flatten() };
    }

    try {
        await addDoc(collection(db, 'libraryBooks'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/library`);
        return { success: true, message: "Book added successfully." };
    } catch(e) {
        return { success: false, error: "Failed to add book." };
    }
}

export async function getBooks(schoolId: string, categoryId?: string) {
    const constraints = [where('schoolId', '==', schoolId)];
    if (categoryId) {
        constraints.push(where('categoryId', '==', categoryId));
    }
    const q = query(collection(db, 'libraryBooks'), ...constraints);
    const snapshot = await getDocs(q);
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return books;
}

export async function updateBook(prevState: any, formData: FormData) {
    const parsed = UpdateBookSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
         console.log(parsed.error.flatten());
        return { success: false, error: 'Invalid data provided for update.', details: parsed.error.flatten() };
    }

    const { id, ...updateData } = parsed.data;
    const schoolId = formData.get('schoolId') as string;

    try {
        const docRef = doc(db, 'libraryBooks', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};

        await updateDoc(docRef, updateData);
        revalidatePath(`/director/dashboard/${schoolId}/admin/library`);
        return { success: true, message: 'Book updated.' };
    } catch (e) { return { success: false, error: 'Failed to update book.' }; }
}

export async function deleteBook(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'libraryBooks', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/library`);
        return { success: true };
    } catch(e) {
        return { success: false, error: 'Failed to delete book.' };
    }
}


// ========== ISSUE & RETURN ==========
// To be implemented in Phase 2
