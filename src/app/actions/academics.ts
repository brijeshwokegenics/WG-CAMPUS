
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const ClassSchema = z.object({
  name: z.string().min(1, 'Class name cannot be empty.'),
  sections: z.array(z.string().min(1, 'Section name cannot be empty.')).min(1, 'At least one section is required.'),
  schoolId: z.string().min(1, 'School ID is required.'),
});

// For updates, the schoolId is not part of the form, so we omit it from the update schema.
const UpdateClassSchema = ClassSchema.omit({ schoolId: true });


export async function getClassesForSchool(schoolId: string) {
  if (!schoolId) {
    return { success: false, error: 'School ID is required.' };
  }

  try {
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);

    const classes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as { id: string; name: string; sections: string[]; schoolId: string }[];
    
    // Sort classes alphanumerically, e.g., Class 1, Class 2, ..., Class 10
    classes.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });


    return { success: true, data: classes };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return { success: false, error: 'Failed to fetch classes.' };
  }
}

export async function createClass(prevState: any, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    sections: formData.getAll('sections').filter(s => typeof s === 'string' && s.trim() !== ''),
    schoolId: formData.get('schoolId'),
  };
  
  const parsed = ClassSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
  }
  
  const { schoolId } = parsed.data;

  try {
    // Check for duplicate class name within the same school
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('schoolId', '==', schoolId), where('name', '==', parsed.data.name));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, error: `A class named "${parsed.data.name}" already exists.` };
    }

    await addDoc(classesRef, parsed.data);
    
    revalidatePath(`/director/dashboard/${schoolId}/academics/classes`);
    return { success: true, message: 'Class created successfully!' };
  } catch (error) {
    console.error('Error creating class:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function updateClass(prevState: any, formData: FormData) {
    const classId = formData.get('classId') as string;
    const schoolId = formData.get('schoolId') as string;

    if (!classId || !schoolId) {
        return { success: false, error: 'Class ID and School ID are required.' };
    }

    const rawData = {
        name: formData.get('name'),
        sections: formData.getAll('sections').filter(s => typeof s === 'string' && s.trim() !== ''),
    };

    const parsed = UpdateClassSchema.safeParse(rawData);

    if (!parsed.success) {
        return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    }

    try {
        const classDocRef = doc(db, 'classes', classId);
        
        // Optional: Verify the class belongs to the school before updating
        const classDoc = await getDoc(classDocRef);
        if (!classDoc.exists() || classDoc.data().schoolId !== schoolId) {
            return { success: false, error: "Class not found or permission denied." };
        }
        
        // Check for duplicate class name within the same school (excluding the current class)
        const classesRef = collection(db, 'classes');
        const q = query(classesRef, where('schoolId', '==', schoolId), where('name', '==', parsed.data.name));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty && querySnapshot.docs.some(doc => doc.id !== classId)) {
            return { success: false, error: `Another class named "${parsed.data.name}" already exists.` };
        }

        await updateDoc(classDocRef, parsed.data);

        revalidatePath(`/director/dashboard/${schoolId}/academics/classes`);
        return { success: true, message: 'Class updated successfully!' };
    } catch (error) {
        console.error('Error updating class:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}


export async function deleteClass({ classId, schoolId }: { classId: string; schoolId: string }) {
    if (!classId || !schoolId) {
        return { success: false, error: 'Class ID and School ID are required.' };
    }

    try {
        const classDocRef = doc(db, 'classes', classId);

        // Security check: Verify the class belongs to the correct school before deleting.
        const classDoc = await getDoc(classDocRef);
        if (!classDoc.exists() || classDoc.data().schoolId !== schoolId) {
            return { success: false, error: "Class not found or you don't have permission to delete it." };
        }
        
        await deleteDoc(classDocRef);

        revalidatePath(`/director/dashboard/${schoolId}/academics/classes`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting class:", error);
        return { success: false, error: "An unexpected error occurred while deleting the class." };
    }
}
