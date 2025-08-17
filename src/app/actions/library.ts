
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, runTransaction, serverTimestamp, increment, orderBy, documentId } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';


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
  const q = query(collection(db, 'libraryCategories'), where('schoolId', '==', schoolId), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

export async function getBooks(schoolId: string, categoryId?: string, searchTerm?: string) {
    let constraints = [where('schoolId', '==', schoolId)];
    if (categoryId) {
        constraints.push(where('categoryId', '==', categoryId));
    }
    
    let booksQuery = query(collection(db, 'libraryBooks'), ...constraints, orderBy('title'));
    let books = (await getDocs(booksQuery)).docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        // This is a client-side filter. For large datasets, a more advanced search solution like Algolia would be better.
        books = books.filter(book => 
            (book.title as string).toLowerCase().includes(lowercasedTerm) ||
            (book.author as string).toLowerCase().includes(lowercasedTerm) ||
            (book.isbn as string)?.includes(lowercasedTerm)
        );
    }

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
const IssueBookSchema = z.object({
  schoolId: z.string(),
  bookId: z.string(),
  memberId: z.string(), // studentId or staff userId
  memberType: z.enum(['Student', 'Staff']),
});

export async function issueBook(prevState: any, formData: FormData) {
    const parsed = IssueBookSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: "Invalid data provided." };

    const { schoolId, bookId, memberId } = parsed.data;
    const bookRef = doc(db, 'libraryBooks', bookId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const bookDoc = await transaction.get(bookRef);
            if (!bookDoc.exists() || bookDoc.data().schoolId !== schoolId) throw new Error("Book not found.");
            if (bookDoc.data().availableStock < 1) throw new Error("Book is not available.");

            transaction.update(bookRef, { availableStock: increment(-1) });
            
            const newIssueRef = doc(collection(db, 'libraryIssues'));
            transaction.set(newIssueRef, {
                ...parsed.data,
                issueDate: serverTimestamp(),
                dueDate: addDays(new Date(), 15), // Due in 15 days
                status: 'issued',
            });
        });
        revalidatePath(`/director/dashboard/${schoolId}/admin/library`);
        return { success: true, message: "Book issued successfully." };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to issue book." };
    }
}


export async function getMemberHistory(schoolId: string, memberId: string) {
    const q = query(
        collection(db, 'libraryIssues'),
        where('schoolId', '==', schoolId),
        where('memberId', '==', memberId),
        orderBy('issueDate', 'desc')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];
    
    const issues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const bookIds = [...new Set(issues.map(i => i.bookId))];
    const bookDetails: Record<string, any> = {};

    if (bookIds.length > 0) {
        const booksQuery = query(collection(db, 'libraryBooks'), where(documentId(), 'in', bookIds));
        const booksSnapshot = await getDocs(booksQuery);
        booksSnapshot.forEach(doc => {
            bookDetails[doc.id] = doc.data();
        });
    }

    return issues.map(issue => ({
        ...issue,
        bookTitle: bookDetails[issue.bookId]?.title || 'Unknown Book',
        issueDate: issue.issueDate?.toDate(),
        dueDate: issue.dueDate?.toDate(),
        returnDate: issue.returnDate?.toDate(),
    }));
}


export async function returnBook(issueId: string, schoolId: string) {
    const issueRef = doc(db, 'libraryIssues', issueId);

    try {
        await runTransaction(db, async (transaction) => {
            const issueDoc = await transaction.get(issueRef);
            if (!issueDoc.exists() || issueDoc.data().schoolId !== schoolId) throw new Error("Issue record not found.");
            if (issueDoc.data().status === 'returned') throw new Error("Book already returned.");

            const { bookId } = issueDoc.data();
            const bookRef = doc(db, 'libraryBooks', bookId);

            transaction.update(issueRef, { status: 'returned', returnDate: serverTimestamp() });
            transaction.update(bookRef, { availableStock: increment(1) });
        });
        revalidatePath(`/director/dashboard/${schoolId}/admin/library`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to return book." };
    }
}

export async function getFullIssueHistory(schoolId: string) {
    const q = query(
        collection(db, 'libraryIssues'),
        where('schoolId', '==', schoolId),
        orderBy('issueDate', 'desc')
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const issues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const bookIds = [...new Set(issues.map(i => i.bookId))];
    const studentIds = [...new Set(issues.filter(i => i.memberType === 'Student').map(i => i.memberId))];
    const staffIds = [...new Set(issues.filter(i => i.memberType === 'Staff').map(i => i.memberId))];

    const [bookDetails, studentDetails, staffDetails] = await Promise.all([
        getDocsByIds(collection(db, 'libraryBooks'), bookIds, schoolId),
        getDocsByIds(collection(db, 'students'), studentIds, schoolId),
        getDocsByIds(collection(db, 'users'), staffIds, schoolId),
    ]);

    return issues.map(issue => {
        let memberName = 'Unknown Member';
        if (issue.memberType === 'Student') {
            memberName = studentDetails[issue.memberId]?.studentName || 'Unknown Student';
        } else if (issue.memberType === 'Staff') {
            memberName = staffDetails[issue.memberId]?.name || 'Unknown Staff';
        }

        return {
            ...issue,
            bookTitle: bookDetails[issue.bookId]?.title || 'Unknown Book',
            memberName,
            issueDate: issue.issueDate?.toDate(),
            dueDate: issue.dueDate?.toDate(),
            returnDate: issue.returnDate?.toDate(),
        }
    });
}

async function getDocsByIds(collectionRef: any, ids: string[], schoolId: string) {
    const details: Record<string, any> = {};
    if (ids.length === 0) return details;

    // Firestore 'in' queries are limited to 30 items per query.
    // We need to chunk the ids array if it's larger than 30.
    const queryChunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        queryChunks.push(ids.slice(i, i + 30));
    }

    for (const chunk of queryChunks) {
        if (chunk.length === 0) continue;
        const q = query(collectionRef, where('__name__', 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            if (doc.data().schoolId === schoolId) {
                details[doc.id] = doc.data();
            }
        });
    }

    return details;
}
