
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { startOfToday, endOfToday, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';


// ========== EXPENSE CATEGORIES ==========
const ExpenseCategorySchema = z.object({
  name: z.string().min(3, "Category name is required."),
  description: z.string().optional(),
  schoolId: z.string(),
});
const UpdateExpenseCategorySchema = ExpenseCategorySchema.omit({ schoolId: true });

export async function createExpenseCategory(prevState: any, formData: FormData) {
  const parsed = ExpenseCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data provided.' };
  
  try {
    const q = query(collection(db, 'expenseCategories'), where('schoolId', '==', parsed.data.schoolId), where('name', '==', parsed.data.name));
    const existing = await getDocs(q);
    if (!existing.empty) return { success: false, error: `An expense category named "${parsed.data.name}" already exists.` };
    
    await addDoc(collection(db, 'expenseCategories'), parsed.data);
    revalidatePath(`/accountant/${parsed.data.schoolId}/expenses`);
    return { success: true, message: 'Category created successfully.' };
  } catch (e) {
    return { success: false, error: 'Failed to create category.' };
  }
}

export async function getExpenseCategories(schoolId: string) {
  try {
    const q = query(collection(db, 'expenseCategories'), where('schoolId', '==', schoolId), orderBy('name'));
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: categories };
  } catch (e) {
    return { success: false, error: 'Failed to fetch categories.' };
  }
}

export async function updateExpenseCategory(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = UpdateExpenseCategorySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data' };
    
    try {
        const docRef = doc(db, 'expenseCategories', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/accountant/${schoolId}/expenses`);
        return { success: true, message: 'Category updated.' };
    } catch (e) { return { success: false, error: 'Failed to update category.' }; }
}

export async function deleteExpenseCategory(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'expenseCategories', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await deleteDoc(docRef);
        revalidatePath(`/accountant/${schoolId}/expenses`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to delete category.'}; }
}

// ========== EXPENSES ==========
const ExpenseSchema = z.object({
  schoolId: z.string(),
  expenseCategoryId: z.string().min(1, "Category is required."),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero."),
  date: z.date(),
  description: z.string().min(3, "Description is required."),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
});
const UpdateExpenseSchema = ExpenseSchema.omit({schoolId: true});

export async function createExpense(prevState: any, formData: FormData) {
    const rawData = {
        ...Object.fromEntries(formData),
        date: new Date(formData.get('date') as string),
    };
    const parsed = ExpenseSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    
    try {
        await addDoc(collection(db, 'expenses'), parsed.data);
        revalidatePath(`/accountant/${parsed.data.schoolId}/expenses`);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}`);
        return { success: true, message: 'Expense recorded successfully.' };
    } catch (e) {
        return { success: false, error: 'Failed to record expense.' };
    }
}

export async function getExpenses(schoolId: string, categoryId?: string) {
  try {
    const constraints = [where('schoolId', '==', schoolId), orderBy('date', 'desc')];
    if (categoryId) {
        constraints.push(where('expenseCategoryId', '==', categoryId));
    }
    const q = query(collection(db, 'expenses'), ...constraints);
    const snapshot = await getDocs(q);
    const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
    }));
    return { success: true, data: expenses };
  } catch (e) {
    return { success: false, error: 'Failed to fetch expenses.' };
  }
}


export async function getExpensesSummary(schoolId: string) {
    if (!schoolId) {
        return { success: false, error: "School ID is required." };
    }

    try {
        const todayStart = startOfToday();
        const todayEnd = endOfToday();
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        const yearStart = startOfYear(new Date());
        const yearEnd = endOfYear(new Date());

        const expensesRef = collection(db, 'expenses');
        
        const dailyQuery = query(expensesRef, where('schoolId', '==', schoolId), where('date', '>=', todayStart), where('date', '<=', todayEnd));
        const monthlyQuery = query(expensesRef, where('schoolId', '==', schoolId), where('date', '>=', monthStart), where('date', '<=', monthEnd));
        const yearlyQuery = query(expensesRef, where('schoolId', '==', schoolId), where('date', '>=', yearStart), where('date', '<=', yearEnd));

        const [dailySnapshot, monthlySnapshot, yearlySnapshot] = await Promise.all([
            getDocs(dailyQuery),
            getDocs(monthlyQuery),
            getDocs(yearlyQuery),
        ]);

        const dailyTotal = dailySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
        const monthlyTotal = monthlySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
        const yearlyTotal = yearlySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

        return {
            success: true,
            data: {
                daily: dailyTotal,
                monthly: monthlyTotal,
                yearly: yearlyTotal,
            }
        };

    } catch (error) {
        console.error("Error fetching expenses summary:", error);
        return { success: false, error: "Failed to fetch expenses summary." };
    }
}

    