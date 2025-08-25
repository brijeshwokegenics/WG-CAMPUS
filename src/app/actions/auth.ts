
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';


const LoginSchema = z.object({
  schoolId: z.string().trim().min(1, { message: "School ID is required." }),
  userId: z.string().trim().min(1, { message: "User ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginState = {
  errors?: {
    schoolId?: string[];
    userId?: string[];
    password?: string[];
  };
  message?: string | null;
  role?: string | null;
  schoolDocId?: string | null;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  const { schoolId, userId, password } = validatedFields.data;
  let schoolDocId: string | null = null;
  let userRole: string | null = null;
  let redirectPath: string | null = null;

  try {
    const schoolsRef = collection(db, 'schools');
    const schoolQuery = query(schoolsRef, where("schoolId", "==", schoolId));
    const schoolSnapshot = await getDocs(schoolQuery);

    if (schoolSnapshot.empty) {
        return { message: 'Invalid credentials. Please check your School ID, User ID, and password.' };
    }
    
    const schoolDoc = schoolSnapshot.docs[0];
    schoolDocId = schoolDoc.id;
    const schoolData = schoolDoc.data();
    
    if (!schoolData.enabled) {
        return { message: 'This school account has been disabled. Please contact the administrator.' };
    }

    // Check if it's the director logging in
    if (userId === schoolId || userId.toLowerCase() === 'director') {
        if (schoolData.password === password) {
            userRole = 'director';
            redirectPath = `/director/dashboard/${schoolDocId}`;
        } else {
            return { message: 'Invalid credentials for director.' };
        }
    } else {
        // Check for other users (teacher, accountant, etc.)
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, 
            where("schoolId", "==", schoolDocId),
            where("userId", "==", userId)
        );
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
            return { message: 'User not found in this school.' };
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== password) {
            return { message: 'Invalid password for user.' };
        }
        
        if (!userData.enabled) {
            return { message: 'This user account has been disabled.' };
        }
        
        userRole = userData.role;
        // Determine redirect path based on role
        switch(userRole) {
            case 'Admin':
                redirectPath = `/admin/${schoolDocId}/dashboard`;
                break;
            case 'Accountant':
                redirectPath = `/accountant/${schoolDocId}/dashboard`;
                break;
            case 'Teacher':
                redirectPath = `/teacher/${schoolDocId}/dashboard`;
                break;
             case 'Librarian':
                redirectPath = `/librarian/${schoolDocId}/dashboard`;
                break;
            case 'Parent':
                redirectPath = `/parent/${schoolDocId}/dashboard`;
                break;
            case 'Principal':
                 redirectPath = `/director/dashboard/${schoolDocId}/principal/dashboard`;
                 break;
            case 'HR':
                redirectPath = `/director/dashboard/${schoolId}/hr/dashboard`;
                break;
            case 'Front Desk':
                redirectPath = `/front-desk/${schoolDocId}/dashboard`;
                break;
            // Add other role-based redirects here
            default:
                // Default to director dashboard for now if role has no specific landing page
                redirectPath = `/director/dashboard/${schoolDocId}`;
        }
    }

    if (!redirectPath) {
        return { message: 'Invalid credentials or unknown user role.' };
    }

  } catch (e: any) {
    return {
      message: `Database error: ${e.message}`,
    };
  }

  redirect(redirectPath);
}
