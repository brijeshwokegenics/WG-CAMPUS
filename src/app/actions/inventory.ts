
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, serverTimestamp, runTransaction, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';


// ========== ITEM CATEGORY ==========
const ItemCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  schoolId: z.string(),
});

export async function createItemCategory(prevState: any, formData: FormData) {
  const parsed = ItemCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: "Invalid data provided." };
  }
  try {
    const categoriesRef = collection(db, 'inventoryCategories');
    const q = query(categoriesRef, where('schoolId', '==', parsed.data.schoolId), where('name', '==', parsed.data.name));
    const existing = await getDocs(q);
    if (!existing.empty) {
        return { success: false, error: `A category named "${parsed.data.name}" already exists.` };
    }
    await addDoc(categoriesRef, parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
    return { success: true, message: "Category created." };
  } catch (e) {
    return { success: false, error: "Failed to create category." };
  }
}

export async function getItemCategories(schoolId: string) {
  try {
    const q = query(collection(db, 'inventoryCategories'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: categories };
  } catch (e) {
    return { success: false, error: "Failed to fetch categories." };
  }
}

export async function deleteItemCategory(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'inventoryCategories', id);
        // Add security check here if needed
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed to delete category." };
    }
}


// ========== INVENTORY ITEM ==========
const InventoryItemSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    categoryId: z.string().min(1, "Category is required."),
    reorderLevel: z.coerce.number().min(0).optional(),
    schoolId: z.string(),
});

export async function createInventoryItem(prevState: any, formData: FormData) {
    const parsed = InventoryItemSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        return { success: false, error: "Invalid item data." };
    }
    try {
        const dataToSave = {
            ...parsed.data,
            quantity: 0, // Always start with 0 quantity
        };
        await addDoc(collection(db, 'inventoryItems'), dataToSave);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
        return { success: true, message: "Item created successfully." };
    } catch (e) {
        return { success: false, error: "Failed to create item." };
    }
}

export async function getInventoryItems(schoolId: string) {
    try {
        const q = query(collection(db, 'inventoryItems'), where('schoolId', '==', schoolId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return { success: true, data: [] };
        }
        
        const categoriesRes = await getItemCategories(schoolId);
        const categories = categoriesRes.success ? categoriesRes.data : [];
        const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat.name]));

        const items = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                categoryName: categoryMap.get(data.categoryId) || 'Uncategorized',
            }
        });
        return { success: true, data: items };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to fetch items." };
    }
}


// ========== STOCK MANAGEMENT ==========
const StockUpdateSchema = z.object({
    itemId: z.string(),
    schoolId: z.string(),
    type: z.enum(['in', 'out']),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    notes: z.string().optional(),
});


export async function updateStock(prevState: any, formData: FormData) {
    const parsed = StockUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        return { success: false, error: "Invalid stock update data." };
    }

    const { itemId, schoolId, type, quantity, notes } = parsed.data;
    const itemRef = doc(db, 'inventoryItems', itemId);
    const historyRef = collection(db, 'inventoryHistory');

    try {
        await runTransaction(db, async (transaction) => {
            const itemDoc = await transaction.get(itemRef);
            if (!itemDoc.exists()) {
                throw new Error("Item not found.");
            }

            const currentQuantity = itemDoc.data().quantity;
            const newQuantity = type === 'in' ? currentQuantity + quantity : currentQuantity - quantity;

            if (newQuantity < 0) {
                throw new Error("Cannot issue more stock than available.");
            }

            transaction.update(itemRef, { quantity: newQuantity });
            
            const historyData = {
                itemId,
                schoolId,
                type,
                quantity,
                notes: notes || '',
                date: serverTimestamp(),
                quantityBefore: currentQuantity,
                quantityAfter: newQuantity,
            };
            // In a transaction, we can't use addDoc directly, so we create a new doc ref and set it.
            const newHistoryRef = doc(collection(db, "inventoryHistory"));
            transaction.set(newHistoryRef, historyData);
        });

        revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
        return { success: true, message: `Stock ${type === 'in' ? 'added' : 'issued'} successfully.` };

    } catch (e: any) {
        return { success: false, error: e.message || "Failed to update stock." };
    }
}

export async function getInventoryItemHistory(itemId: string, schoolId: string) {
    try {
        const q = query(
            collection(db, 'inventoryHistory'), 
            where('itemId', '==', itemId),
            where('schoolId', '==', schoolId),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date.toDate(),
            }
        });
        return { success: true, data: history };
    } catch (e) {
        return { success: false, error: "Failed to fetch item history." };
    }
}
