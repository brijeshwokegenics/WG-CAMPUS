
'use server';

import { z } from 'zod';
import { collection, addDoc, getDocs, doc, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const ClassSchema = z.object({
  name: z.string().min(1, { message: "Class name is required." }),
  section: z.string().min(1, { message: "Section is required." }),
  studentCount: z.coerce.number().int().min(0, { message: "Student count must be a positive number." }),
});

export type ClassState = {
  errors?: {
    name?: string[];
    section?: string[];
    studentCount?: string[];
  };
  message?: string | null;
};

export async function createClass(schoolId: string, prevState: ClassState, formData: FormData): Promise<ClassState> {
  if (!schoolId) {
    return { message: 'Database error: School ID is missing.' };
  }
  
  const validatedFields = ClassSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'An error occurred. Please review the form and try again.',
    };
  }

  try {
    const classesCollectionRef = collection(db, 'schools', schoolId, 'classes');
    await addDoc(classesCollectionRef, validatedFields.data);
  } catch (e: any) {
    return {
      message: `Database error: ${e.message}`,
    };
  }

  revalidatePath(`/director/dashboard/${schoolId}/academics/classes`);
  redirect(`/director/dashboard/${schoolId}/academics/classes`);
}


export async function getClasses(schoolId: string) {
  try {
     if (!schoolId) {
        return { classes: [], error: "School ID is required to fetch classes." };
    }
    const classesColRef = collection(db, 'schools', schoolId, 'classes');
    const classSnapshot = await getDocs(classesColRef);
    
    if (classSnapshot.empty) {
        return { classes: [] };
    }

    const classesList = classSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { classes: classesList };
  } catch (error) {
    console.error("Error fetching classes:", error);
    return { classes: [], error: "Failed to fetch classes." };
  }
}
