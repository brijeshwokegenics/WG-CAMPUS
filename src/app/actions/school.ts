
'use server';

import { z } from 'zod';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';


const BaseSchoolSchema = z.object({
  schoolName: z.string().min(3, { message: "School name must be at least 3 characters long." }),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters long." }),
  city: z.string().min(2, { message: "City must be at least 2 characters long." }),
  state: z.string().min(2, { message: "State must be at least 2 characters long." }),
  zipcode: z.string().min(5, { message: "Zip code must be at least 5 characters long." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits long." }),
  schoolId: z.string(),
  enabled: z.boolean().default(true),
});

const SchoolSchema = BaseSchoolSchema.extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


const UpdateSchoolSchema = BaseSchoolSchema.extend({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine(data => {
    // If password is provided, it must be at least 6 chars and confirmed
    if (data.password || data.confirmPassword) {
        return data.password && data.password.length >= 6 && data.password === data.confirmPassword;
    }
    return true; // If no password is provided, validation passes
}, {
    message: "Passwords must match and be at least 6 characters long.",
    path: ["confirmPassword"],
});


export type State = {
  errors?: {
    [key: string]: string[] | undefined;
     schoolName?: string[];
    contactEmail?: string[];
    address?: string[];
    city?: string[];
    state?: string[];
    zipcode?: string[];
    phone?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string | null;
  data?: {
    schoolId: string;
  } | null;
};


export async function getSchools() {
  try {
    const schoolsCol = collection(db, 'schools');
    const schoolSnapshot = await getDocs(schoolsCol);
    const schoolsList = schoolSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { schools: schoolsList };
  } catch (error) {
    console.error("Error fetching schools:", error);
    return { schools: [] };
  }
}

export async function getSchool(id: string) {
    try {
        const schoolDocRef = doc(db, 'schools', id);
        const schoolDoc = await getDoc(schoolDocRef);

        if (!schoolDoc.exists()) {
            return { error: "School not found." };
        }

        return { school: { id: schoolDoc.id, ...schoolDoc.data() } };
    } catch (e: any) {
        console.error("Error fetching school:", e);
        return { error: `Database error: ${e.message}` };
    }
}


export async function createSchool(prevState: State, formData: FormData): Promise<State> {
  // We need to manually add enabled and then parse
  const formDataObj = Object.fromEntries(formData.entries());
  formDataObj.enabled = 'true';
  
  const validatedFields = SchoolSchema.safeParse(formDataObj);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  const { confirmPassword, ...schoolData } = validatedFields.data;

  try {
    const schoolsRef = collection(db, 'schools');
    const q = query(schoolsRef, where("contactEmail", "==", schoolData.contactEmail));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return { message: 'This email is already registered.' };
    }

    await addDoc(collection(db, 'schools'), schoolData);
    
    revalidatePath('/super-admin/dashboard/schools');
    return { message: 'School created successfully!', data: { schoolId: schoolData.schoolId } };

  } catch (e: any) {
    return {
      message: `Database error: ${e.message}`,
    };
  }
}

export async function updateSchool(id: string, prevState: State, formData: FormData): Promise<State> {
    const formDataObj = Object.fromEntries(formData.entries());
    
    // Only include password fields for validation if they are not empty
    if (!formDataObj.password && !formDataObj.confirmPassword) {
      delete formDataObj.password;
      delete formDataObj.confirmPassword;
    }

    const validatedFields = UpdateSchoolSchema.safeParse(formDataObj);
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the fields.',
        };
    }

    const { confirmPassword, ...schoolData } = validatedFields.data;

     // If the password field is empty/undefined, we don't want to update it in the database.
    if (!schoolData.password) {
        delete schoolData.password;
    }

    try {
        const schoolDocRef = doc(db, 'schools', id);
        await updateDoc(schoolDocRef, schoolData);
        revalidatePath('/super-admin/dashboard/schools');
        revalidatePath(`/super-admin/dashboard/schools/edit/${id}`);
        return { message: 'School updated successfully!' };
    } catch (e: any) {
        return {
            message: `Database error: ${e.message}`,
        };
    }
}


export async function toggleSchoolStatus(schoolId: string, newStatus: boolean) {
    try {
        const schoolsRef = collection(db, 'schools');
        const q = query(schoolsRef, where("schoolId", "==", schoolId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("School not found.");
        }
        
        const schoolDocRef = querySnapshot.docs[0].ref;

        await updateDoc(schoolDocRef, {
            enabled: newStatus
        });
        
        revalidatePath('/super-admin/dashboard/schools');
        return { success: true, message: `School status updated successfully.` };
    } catch (e: any) {
        console.error("Error toggling school status:", e);
        return { success: false, message: `Database error: ${e.message}` };
    }
}
