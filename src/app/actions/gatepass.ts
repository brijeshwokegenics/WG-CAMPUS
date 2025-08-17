
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getStudentById } from './academics';

const PassTypes = z.enum([
    // Academic & Class
    "Hall Pass", "Library Pass", "Laboratory Pass",
    // Movement & Attendance
    "Late Arrival Pass", "Early Dismissal Pass", "Gate Pass",
    // Health & Safety
    "Medical/Clinic Pass"
]);

const GatePassSchema = z.object({
  schoolId: z.string(),
  studentId: z.string(),
  passType: PassTypes,
  passDate: z.date(),
  reason: z.string().min(5, "A valid reason is required."),
  issuedBy: z.string().min(1, "Issuer name is required."),
  status: z.enum(['Issued', 'Returned', 'Expired']).default('Issued'),
  outTime: z.string(),
  returnTime: z.string().optional(),
});

export async function createGatePass(prevState: any, formData: FormData) {
  const rawData = {
    ...Object.fromEntries(formData.entries()),
    passDate: new Date(formData.get('passDate') as string),
  };

  const parsed = GatePassSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { success: false, error: "Invalid data provided." };
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
        const q = query(
            collection(db, 'gatePasses'), 
            where('schoolId', '==', schoolId),
            orderBy('createdAt', 'desc'),
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
        }));
        
        const studentIds = [...new Set(passes.map(p => p.studentId))];
        const studentDetails: Record<string, any> = {};

        // Fetch student details in batches of 30
        const studentIdChunks = [];
        for (let i = 0; i < studentIds.length; i += 30) {
            studentIdChunks.push(studentIds.slice(i, i + 30));
        }

        for (const chunk of studentIdChunks) {
            const studentsQuery = query(collection(db, 'students'), where('__name__', 'in', chunk));
            const studentsSnapshot = await getDocs(studentsQuery);
            studentsSnapshot.forEach(doc => {
                studentDetails[doc.id] = doc.data();
            });
        }
        
        const populatedPasses = passes.map(pass => ({
            ...pass,
            studentName: studentDetails[pass.studentId]?.studentName || 'Unknown Student',
            className: studentDetails[pass.studentId]?.className || 'N/A'
        }));

        return { success: true, data: populatedPasses };
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
        const studentRes = await getStudentById(passData.studentId, schoolId);

        return {
            success: true,
            data: {
                ...passData,
                id: docSnap.id,
                passDate: passData.passDate.toDate(),
                student: studentRes.success ? studentRes.data : null,
            }
        };

    } catch (error) {
        console.error("Error fetching gate pass:", error);
        return { success: false, error: "Failed to fetch gate pass." };
    }
}
