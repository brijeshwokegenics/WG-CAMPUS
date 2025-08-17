
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
  schoolLogoUrl: z.string().url().optional().or(z.literal('')),
  affiliationCode: z.string().optional(),
  registrationNumber: z.string().optional(),
  schoolWebsite: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

const SchoolSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters."),
  contactEmail: z.string().email("Please provide a valid email address."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  zipcode: z.string().min(3, "Zip code is required."),
  phone: z.string().min(6, "Phone number is required."),
  schoolId: z.string().min(3, "School ID is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters."),
  schoolLogoUrl: z.string().url().optional().or(z.literal('')),
  affiliationCode: z.string().optional(),
  registrationNumber: z.string().optional(),
  schoolWebsite: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});


const UpdateSchoolSchema = BaseSchoolSchema;

const UpdatePasswordSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


export type State = {
  message: string | null;
  errors?: Record<string, string[]>;
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
  const raw = Object.fromEntries(formData.entries());
  // Manually add 'enabled' since it's not in the form
  const rawWithDefaults = { ...raw, enabled: true };
  const parsed = SchoolSchema.safeParse(rawWithDefaults);

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() || "form";
      errors[key] = errors[key] || [];
      errors[key].push(issue.message);
    }
    return {
      message: "Please fix the highlighted fields and try again.",
      errors,
    };
  }

  const { confirmPassword, ...schoolData } = parsed.data;

  try {
    const schoolsRef = collection(db, 'schools');
    const q = query(schoolsRef, where("contactEmail", "==", schoolData.contactEmail));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return { message: 'This email is already registered.', errors: { contactEmail: ["This email is already in use."] } };
    }

    const schoolIdQuery = query(schoolsRef, where("schoolId", "==", schoolData.schoolId));
    const schoolIdSnapshot = await getDocs(schoolIdQuery);

    if (!schoolIdSnapshot.empty) {
      return {
        message: "A school with this School ID already exists.",
        errors: { schoolId: ["This School ID is already in use."] },
      };
    }

    await addDoc(collection(db, 'schools'), schoolData);
    
    revalidatePath('/super-admin/dashboard/schools');
    return { message: 'School created successfully!', errors: {} };

  } catch (e: any) {
    return {
      message: `Something went wrong while creating the school. Please try again later.`,
      errors: {},
    };
  }
}

export async function updateSchool(id: string, prevState: State, formData: FormData): Promise<State> {
    const formDataObj = Object.fromEntries(formData.entries());
    
    if (typeof formDataObj.enabled === 'string') {
        formDataObj.enabled = formDataObj.enabled === 'true';
    }
    
    if (formDataObj.schoolLogoUrl === 'undefined' || formDataObj.schoolLogoUrl === '') {
        formDataObj.schoolLogoUrl = '';
    }
    
    if (formDataObj.schoolWebsite === 'undefined' || formDataObj.schoolWebsite === '') {
        formDataObj.schoolWebsite = '';
    }


    const validatedFields = UpdateSchoolSchema.safeParse(formDataObj);
    
    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten())
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the fields.',
        };
    }

    const schoolData  = validatedFields.data;
    
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


export async function updateSchoolPassword(id: string, prevState: State, formData: FormData): Promise<State> {
    const validatedFields = UpdatePasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed. Please check the fields.',
        };
    }

    const { password } = validatedFields.data;

    try {
        const schoolDocRef = doc(db, 'schools', id);
        await updateDoc(schoolDocRef, { password });
        revalidatePath('/super-admin/dashboard/schools');
        return { message: 'Password updated successfully!' };
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
