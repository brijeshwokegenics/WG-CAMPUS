
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, QueryConstraint, setDoc, and, or } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const UserRole = z.enum(["Teacher", "Accountant", "Librarian", "Admin"]);

export const UserSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required.'),
  name: z.string().min(2, 'User name must be at least 2 characters.'),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().min(10, "A valid 10-digit mobile number is required."),
  role: UserRole,
  userId: z.string().min(3, 'User ID must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  enabled: z.boolean().default(true),
});

const UpdateUserSchema = UserSchema.omit({ password: true, schoolId: true });

export async function createUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = UserSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: 'Invalid data provided.', details: parsed.error.flatten() };
  }

  const { schoolId, userId } = parsed.data;

  try {
    // Check for duplicate user ID within the same school
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('schoolId', '==', schoolId), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, error: `A user with User ID "${userId}" already exists in this school.` };
    }

    await addDoc(usersRef, parsed.data);
    
    revalidatePath(`/director/dashboard/${schoolId}/admin/users`);
    return { success: true, message: 'User created successfully!' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'An unexpected error occurred while creating the user.' };
  }
}

export async function getUsersForSchool(schoolId: string) {
  if (!schoolId) {
    return { success: false, error: 'School ID is required.' };
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (z.infer<typeof UserSchema> & { id: string })[];
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users.' };
  }
}

export async function updateUser(prevState: any, formData: FormData) {
    const userId = formData.get('userId') as string;
    const schoolId = formData.get('schoolId') as string; // This is the firestore doc id of the school

    if (!userId || !schoolId) {
        return { success: false, error: 'User doc ID and School ID are required.' };
    }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        enabled: formData.get('enabled') === 'true',
    };

    const parsed = UpdateUserSchema.omit({userId: true}).safeParse(rawData);
    
    if (!parsed.success) {
        return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    }
    
    try {
        const userDocRef = doc(db, 'users', userId);
        
        // Security check
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() || userDoc.data().schoolId !== schoolId) {
            return { success: false, error: "User not found or permission denied." };
        }
        
        await updateDoc(userDocRef, parsed.data);

        revalidatePath(`/director/dashboard/${schoolId}/admin/users`);
        return { success: true, message: 'User updated successfully!' };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}


export async function deleteUser({ userId, schoolId }: { userId: string; schoolId: string }) {
    if (!userId || !schoolId) {
        return { success: false, error: 'User doc ID and School ID are required.' };
    }

    try {
        const userDocRef = doc(db, 'users', userId);

        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() || userDoc.data().schoolId !== schoolId) {
            return { success: false, error: "User not found or permission denied." };
        }
        
        await deleteDoc(userDocRef);

        revalidatePath(`/director/dashboard/${schoolId}/admin/users`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "An unexpected error occurred while deleting the user." };
    }
}

export async function updateUserPassword(docId: string, schoolId: string, newPassword: string) {
    if (!docId || !schoolId || !newPassword) {
        return { success: false, error: "Missing required information." };
    }

    if (newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters." };
    }

    try {
        const userDocRef = doc(db, 'users', docId);
        
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() || userDoc.data().schoolId !== schoolId) {
            return { success: false, error: "User not found or permission denied." };
        }
        
        await updateDoc(userDocRef, { password: newPassword });
        revalidatePath(`/director/dashboard/${schoolId}/admin/users`);
        return { success: true, message: "Password updated successfully." };

    } catch (error) {
         console.error("Error updating user password:", error);
        return { success: false, error: "Failed to update password." };
    }
}

