
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const LoginSchema = z.object({
  schoolId: z.string().trim().min(1, { message: "School ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginState = {
  errors?: {
    schoolId?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function loginSchool(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  const { schoolId, password } = validatedFields.data;
  let schoolDocId: string | null = null;

  try {
    const schoolsRef = collection(db, 'schools');
    const q = query(schoolsRef, where("schoolId", "==", schoolId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return { message: 'Invalid School ID or password.' };
    }
    
    const schoolDoc = querySnapshot.docs[0];
    const school = schoolDoc.data();
    
    if (school.password !== password) {
      return { message: 'Invalid School ID or password.' };
    }

    if (!school.enabled) {
        return { message: 'This school account has been disabled. Please contact the administrator.' };
    }

    schoolDocId = schoolDoc.id;

  } catch (e: any) {
    return {
      message: `Database error: ${e.message}`,
    };
  }

  // Redirect is removed as the target dashboard is deleted.
  // A success message can be shown instead.
  return { message: "Login successful. Dashboard under construction." };
}
