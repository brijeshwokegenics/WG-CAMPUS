'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, serverTimestamp, runTransaction, orderBy, limit } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// ========== CATEGORIES ==========
const ItemCategorySchema = z.object({
  name: z.string().min(3, "Category name is required."),
  description: z.string().optional(),
  schoolId: z.string(),
});
export async function createItemCategory(prevState: any, formData: FormData) {
  const parsed = ItemCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data' };
  try {
    await addDoc(collection(db, 'inventoryCategories'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
    return { success: true, message: 'Category created.' };
  } catch (e) { return { success: false, error: 'Failed to create.' }; }
}
export async function getItemCategories(schoolId: string) {
  const q = query(collection(db, 'inventoryCategories'), where('schoolId', '==', schoolId), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateItemCategory(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = ItemCategorySchema.omit({schoolId: true}).safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data' };
    try {
        const docRef = doc(db, 'inventoryCategories', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
        return { success: true, message: 'Category updated.' };
    } catch (e) { return { success: false, error: 'Failed to update.' }; }
}
export async function deleteItemCategory(id: string, schoolId: string) {
    const docRef = doc(db, 'inventoryCategories', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return;
    await deleteDoc(docRef);
    revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
}


// ========== VENDORS ==========
const VendorSchema = z.object({
  name: z.string().min(3, "Vendor name is required."),
  contactPerson: z.string().optional(),
  phone: z.string().min(10, "Phone number is required."),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  schoolId: z.string(),
});
export async function createVendor(prevState: any, formData: FormData) {
  const parsed = VendorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data' };
  try {
    await addDoc(collection(db, 'inventoryVendors'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
    return { success: true, message: 'Vendor created.' };
  } catch (e) { return { success: false, error: 'Failed to create.' }; }
}
export async function getVendors(schoolId: string) {
  const q = query(collection(db, 'inventoryVendors'), where('schoolId', '==', schoolId), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function updateVendor(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = VendorSchema.omit({schoolId: true}).safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data' };
    try {
        const docRef = doc(db, 'inventoryVendors', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
        return { success: true, message: 'Vendor updated.' };
    } catch (e) { return { success: false, error: 'Failed to update.' }; }
}
export async function deleteVendor(id: string, schoolId: string) {
    const docRef = doc(db, 'inventoryVendors', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return;
    await deleteDoc(docRef);
    revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
}

// ========== UNITS ==========
const UnitSchema = z.object({
    name: z.string().min(1, "Unit name is required."),
    schoolId: z.string(),
});
export async function createUnit(prevState: any, formData: FormData) {
    const parsed = UnitSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: "Invalid data" };
    await addDoc(collection(db, 'inventoryUnits'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
    return { success: true, message: 'Unit created.' };
}
export async function getUnits(schoolId: string) {
    const q = query(collection(db, 'inventoryUnits'), where('schoolId', '==', schoolId), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function deleteUnit(id: string, schoolId: string) {
    const docRef = doc(db, 'inventoryUnits', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return;
    await deleteDoc(docRef);
    revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
}

// ========== LOCATIONS ==========
const LocationSchema = z.object({
    name: z.string().min(2, "Location name is required."),
    schoolId: z.string(),
});
export async function createLocation(prevState: any, formData: FormData) {
    const parsed = LocationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: "Invalid data" };
    await addDoc(collection(db, 'inventoryLocations'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
    return { success: true, message: 'Location created.' };
}
export async function getLocations(schoolId: string) {
    const q = query(collection(db, 'inventoryLocations'), where('schoolId', '==', schoolId), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function deleteLocation(id: string, schoolId: string) {
    const docRef = doc(db, 'inventoryLocations', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return;
    await deleteDoc(docRef);
    revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
}


// ========== INVENTORY ITEMS ==========
const InventoryItemSchema = z.object({
    name: z.string().min(2, "Item name is required."),
    categoryId: z.string().min(1, "Category is required."),
    sku: z.string().optional(),
    unitId: z.string().min(1, "Unit is required"),
    locationId: z.string().min(1, "Location is required"),
    reorderLevel: z.coerce.number().min(0).default(0),
    currentStock: z.coerce.number().min(0).default(0),
    schoolId: z.string(),
});

export async function createInventoryItem(prevState: any, formData: FormData) {
    const parsed = InventoryItemSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    try {
        await addDoc(collection(db, 'inventoryItems'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/inventory`);
        return { success: true, message: 'Item added successfully.' };
    } catch (e) {
        return { success: false, error: 'Failed to add item.' };
    }
}

export async function getInventoryItems(schoolId: string, categoryId?: string) {
    const constraints = [where('schoolId', '==', schoolId)];
    if (categoryId) {
        constraints.push(where('categoryId', '==', categoryId));
    }
    const q = query(collection(db, 'inventoryItems'), ...constraints);
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort manually to avoid composite index requirement
    items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
}


// ========== STOCK MANAGEMENT ==========
const StockUpdateSchema = z.object({
    itemId: z.string(),
    type: z.enum(['add', 'issue']),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
    date: z.date(),
    notes: z.string().optional(),
    issuedTo: z.string().optional(), // For 'issue' type
    schoolId: z.string(),
});

export async function updateStock(prevState: any, formData: FormData) {
    const rawData = {
        ...Object.fromEntries(formData),
        date: new Date(formData.get('date') as string),
    }
    const parsed = StockUpdateSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    }
    
    const { itemId, type, quantity, schoolId } = parsed.data;
    const itemRef = doc(db, 'inventoryItems', itemId);
    const historyRef = collection(db, 'inventoryHistory');

    try {
        await runTransaction(db, async (transaction) => {
            const itemDoc = await transaction.get(itemRef);
            if (!itemDoc.exists() || itemDoc.data().schoolId !== schoolId) throw new Error("Item not found or permission denied.");

            const currentStock = itemDoc.data().currentStock || 0;
            let newStock = currentStock;

            if (type === 'add') {
                newStock += quantity;
            } else { // issue
                if (currentStock < quantity) throw new Error("Insufficient stock to issue.");
                newStock -= quantity;
            }
            
            transaction.update(itemRef, { currentStock: newStock });
            
            // Log the transaction
            const historyData = {
                ...parsed.data,
                timestamp: serverTimestamp(),
                previousStock: currentStock,
                newStock: newStock,
            };
            const newHistoryRef = doc(historyRef); // create a new doc reference
            transaction.set(newHistoryRef, historyData);
        });
        
        revalidatePath(`/director/dashboard/${schoolId}/admin/inventory`);
        return { success: true, message: "Stock updated successfully." };

    } catch (e: any) {
        return { success: false, error: e.message || "Failed to update stock." };
    }
}

export async function getItemHistory(schoolId: string, itemId: string) {
    const q = query(collection(db, 'inventoryHistory'), where('schoolId', '==', schoolId), where('itemId', '==', itemId), orderBy('timestamp', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            timestamp: data.timestamp?.toDate() || new Date(),
        };
    });
}
