
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// ========== FEE HEADS ==========

export const FeeHeadSchema = z.object({
  name: z.string().min(3, "Fee head name must be at least 3 characters."),
  description: z.string().optional(),
  type: z.enum(["One-time", "Annual", "Monthly", "Quarterly"]),
  schoolId: z.string().min(1),
});

export const UpdateFeeHeadSchema = FeeHeadSchema.omit({ schoolId: true });

export async function createFeeHead(prevState: any, formData: FormData) {
  const parsed = FeeHeadSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { success: false, error: "Invalid data provided.", details: parsed.error.flatten() };
  }

  try {
    const feeHeadsRef = collection(db, 'feeHeads');
    const q = query(feeHeadsRef, where('schoolId', '==', parsed.data.schoolId), where('name', '==', parsed.data.name));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: `A fee head named "${parsed.data.name}" already exists.` };
    }

    await addDoc(feeHeadsRef, parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/fee-structure`);
    return { success: true, message: 'Fee head created successfully.' };
  } catch (error) {
    console.error("Error creating fee head:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function getFeeHeads(schoolId: string) {
  try {
    const feeHeadsRef = collection(db, 'feeHeads');
    const q = query(feeHeadsRef, where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const feeHeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: feeHeads };
  } catch (error) {
    console.error("Error fetching fee heads:", error);
    return { success: false, error: "Failed to fetch fee heads." };
  }
}

export async function updateFeeHead(prevState: any, formData: FormData) {
    const feeHeadId = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;

    const parsed = UpdateFeeHeadSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        type: formData.get('type'),
    });

    if (!parsed.success) {
        return { success: false, error: "Invalid data provided.", details: parsed.error.flatten() };
    }

    try {
        const docRef = doc(db, 'feeHeads', feeHeadId);
        // Security check
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Fee head not found or permission denied." };
        }
        
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/fee-structure`);
        return { success: true, message: 'Fee head updated successfully.' };

    } catch (error) {
        console.error("Error updating fee head:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function deleteFeeHead({ id, schoolId }: { id: string; schoolId: string }) {
    try {
        const docRef = doc(db, 'feeHeads', id);
        // Security check
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Fee head not found or permission denied." };
        }
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/fee-structure`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting fee head:", error);
        return { success: false, error: "Failed to delete fee head." };
    }
}


// ========== FEE STRUCTURE ==========

const FeeStructureEntrySchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0, "Amount must be 0 or more."),
});

const FeeStructureSchema = z.object({
  schoolId: z.string(),
  classId: z.string(),
  structure: z.array(FeeStructureEntrySchema),
});


export async function saveFeeStructure(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        classId: formData.get('classId'),
        structure: JSON.parse(formData.get('structure') as string),
    };

    const parsed = FeeStructureSchema.safeParse(rawData);

    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: "Invalid data provided for fee structure." };
    }
    
    const { schoolId, classId, structure } = parsed.data;
    const docId = `${schoolId}_${classId}`;

    try {
        const docRef = doc(db, 'feeStructures', docId);
        await setDoc(docRef, { schoolId, classId, structure });
        
        revalidatePath(`/director/dashboard/${schoolId}/admin/fee-structure`);
        return { success: true, message: "Fee structure saved successfully." };
    } catch (error) {
        console.error("Error saving fee structure:", error);
        return { success: false, error: "Failed to save fee structure." };
    }
}

export async function getFeeStructure(schoolId: string, classId: string) {
    const docId = `${schoolId}_${classId}`;
    try {
        const docRef = doc(db, 'feeStructures', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        return { success: true, data: null }; // Not found is not an error
    } catch (error) {
        console.error("Error fetching fee structure:", error);
        return { success: false, error: "Failed to fetch fee structure." };
    }
}
