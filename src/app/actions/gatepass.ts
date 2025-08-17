
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, orderBy, limit, serverTimestamp, documentId, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getStudentById } from './academics';

const GatePassSchema = z.object({
  schoolId: z.string(),
  passHolderId: z.string().optional(), // studentId or staff userId
  memberType: z.enum(['Student', 'Staff', 'Visitor']),
  passHolderName: z.string().min(1, "Pass holder name is required."), // For visitors, this is the main name. For students/staff, it's a copy.
  passHolderDetails: z.string().optional(), // Class/Section for student, Role for staff, Details for visitor
  passType: z.string().min(1, "Pass type is required."),
  passDate: z.date(),
  reason: z.string().min(5, "A valid reason is required."),
  issuedBy: z.string().min(1, "Issuer name is required."),
  status: z.enum(['Issued', 'Returned', 'Expired']).default('Issued'),
  outTime: z.string(),
  returnTime: z.string().optional(),
  session: z.string().optional(),
  passDuration: z.string().optional(),
});


export async function createGatePass(prevState: any, formData: FormData) {
  const rawData = {
    ...Object.fromEntries(formData.entries()),
    passDate: new Date(formData.get('passDate') as string),
  };

  const parsed = GatePassSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { success: false, error: "Invalid data provided.", details: parsed.error.flatten() };
  }

  try {
    await addDoc(collection(db, 'gatePasses'), {
        ...parsed.data,
        createdAt: serverTimestamp(),
    });
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/gate-pass`);
    return { success: true, message: 'Gate pass created successfully.' };
  } catch (error) {
    console.error("Error creating gate pass:", error);
    return { success: false, error: "Failed to create gate pass." };
  }
}

export async function getRecentGatePasses(schoolId: string) {
    if (!schoolId) return { success: false, error: "School ID is required." };

    try {
        // Removed orderBy to avoid needing a composite index. Sorting will be done in code.
        const q = query(
            collection(db, 'gatePasses'), 
            where('schoolId', '==', schoolId),
            limit(50)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: true, data: [] };
        }

        const passes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            passDate: doc.data().passDate.toDate(),
            createdAt: doc.data().createdAt?.toDate() || new Date(0) // Handle case where createdAt might be null
        }));
        
        // Sort in code to ensure newest passes are first
        passes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return { success: true, data: passes };
    } catch (error) {
        console.error("Error fetching gate passes:", error);
        return { success: false, error: "Failed to fetch gate passes." };
    }
}

export async function updateGatePassStatus(schoolId: string, passId: string, status: 'Returned' | 'Expired') {
    if (!schoolId || !passId || !status) {
        return { success: false, error: "Missing required information." };
    }
    try {
        const docRef = doc(db, 'gatePasses', passId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Permission denied." };
        }

        const updateData: any = { status };
        if (status === 'Returned') {
            updateData.returnTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        await updateDoc(docRef, updateData);

        revalidatePath(`/director/dashboard/${schoolId}/admin/gate-pass`);
        return { success: true };
    } catch (error) {
        console.error("Error updating gate pass:", error);
        return { success: false, error: "Failed to update status." };
    }
}


export async function getGatePassById(schoolId: string, passId: string) {
    if (!schoolId || !passId) {
        return { success: false, error: "Missing required IDs." };
    }

    try {
        const docRef = doc(db, 'gatePasses', passId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Gate pass not found." };
        }
        
        const passData = docSnap.data();
        let studentInfo = null;

        if (passData.memberType === 'Student' && passData.passHolderId) {
            const studentRes = await getStudentById(passData.passHolderId, schoolId);
            if(studentRes.success) studentInfo = studentRes.data;
        }

        return {
            success: true,
            data: {
                ...passData,
                id: docSnap.id,
                passDate: passData.passDate.toDate(),
                student: studentInfo, // Contains photoUrl if student
            }
        };

    } catch (error) {
        console.error("Error fetching gate pass:", error);
        return { success: false, error: "Failed to fetch gate pass." };
    }
}


// Pass Type Management
const PassTypeSchema = z.object({
  name: z.string().min(3, "Pass type name is required."),
  schoolId: z.string(),
});
const UpdatePassTypeSchema = PassTypeSchema.omit({schoolId: true});


export async function createPassType(prevState: any, formData: FormData) {
  const parsed = PassTypeSchema.safeParse({
    name: formData.get('name'),
    schoolId: formData.get('schoolId'),
  });

  if (!parsed.success) return { success: false, error: 'Invalid data' };
  
  try {
    const q = query(collection(db, 'gatePassTypes'), where('schoolId', '==', parsed.data.schoolId), where('name', '==', parsed.data.name));
    const existing = await getDocs(q);
    if (!existing.empty) return { success: false, error: `A pass type named "${parsed.data.name}" already exists.` };

    await addDoc(collection(db, 'gatePassTypes'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/gate-pass`);
    return { success: true, message: 'Pass type created.' };
  } catch (e) { 
    return { success: false, error: 'Failed to create pass type.' }; 
  }
}

export async function getPassTypes(schoolId: string) {
    const q = query(collection(db, 'gatePassTypes'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const passTypes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string } }));
    // Sort in code to prevent needing a composite index
    passTypes.sort((a, b) => a.name.localeCompare(b.name));
    return passTypes;
}

export async function updatePassType(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = UpdatePassTypeSchema.safeParse({ name: formData.get('name')});

    if (!parsed.success) return { success: false, error: 'Invalid data.' };

    try {
        const docRef = doc(db, 'gatePassTypes', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: 'Permission denied.' };
        }
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/gate-pass`);
        return { success: true, message: 'Pass type updated.' };
    } catch (e) {
        return { success: false, error: 'Failed to update pass type.' };
    }
}


export async function deletePassType(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'gatePassTypes', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.' };
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/gate-pass`);
        return { success: true };
    } catch(e) {
        return { success: false, error: 'Failed to delete.' };
    }
}
