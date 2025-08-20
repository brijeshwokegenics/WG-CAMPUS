
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { startOfToday, endOfToday, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';


// ========== EXPENSE CATEGORIES ==========
const ExpenseCategorySchema = z.object({
  name: z.string().min(3, "Category name is required.").trim(),
  description: z.string().optional(),
  schoolId: z.string(),
});
const UpdateExpenseCategorySchema = ExpenseCategorySchema.omit({ schoolId: true });

export async function createExpenseCategory(prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    schoolId: formData.get('schoolId'),
  };
  const parsed = ExpenseCategorySchema.safeParse(rawData);

  if (!parsed.success) {
      return { success: false, error: 'Invalid data provided.' };
  }
  
  try {
    // Perform a case-insensitive check for existing categories
    const categoriesRef = collection(db, 'expenseCategories');
    const q = query(categoriesRef, where('schoolId', '==', parsed.data.schoolId));
    const querySnapshot = await getDocs(q);
    const existingCategories = querySnapshot.docs.map(doc => doc.data().name.toLowerCase());

    if (existingCategories.includes(parsed.data.name.toLowerCase())) {
        return { success: false, error: `An expense category named "${parsed.data.name}" already exists.` };
    }
    
    // If no duplicate found, add the new category
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
        amount: Number(formData.get('amount')),
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
        const monthStart = startOfMonth(new Date());
        const yearStart = startOfYear(new Date());

        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, where('schoolId', '==', schoolId));
        const snapshot = await getDocs(q);

        const allExpenses = snapshot.docs.map(doc => ({
            ...doc.data(),
            date: doc.data().date.toDate()
        }));

        let dailyTotal = 0;
        let monthlyTotal = 0;
        let yearlyTotal = 0;

        for (const expense of allExpenses) {
            const amount = expense.amount;
            
            // Check for this year
            if (expense.date.getFullYear() === yearStart.getFullYear()) {
                yearlyTotal += amount;
                
                // Check for this month
                if (expense.date.getMonth() === monthStart.getMonth()) {
                    monthlyTotal += amount;
                    
                    // Check for today
                    if (expense.date.getDate() === todayStart.getDate()) {
                        dailyTotal += amount;
                    }
                }
            }
        }

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

    