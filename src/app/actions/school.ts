
'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

const SchoolSchema = z.object({
  schoolName: z.string().min(3, { message: "School name must be at least 3 characters long." }),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters long." }),
  city: z.string().min(2, { message: "City must be at least 2 characters long." }),
  state: z.string().min(2, { message: "State must be at least 2 characters long." }),
  zipcode: z.string().min(5, { message: "Zip code must be at least 5 characters long." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits long." }),
  schoolId: z.string(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  confirmPassword: z.string(),
  enabled: z.boolean().default(true),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
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


export async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, which is fine for the first run.
      return { schools: [] };
    }
    throw error;
  }
}

async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}


export async function createSchool(prevState: State, formData: FormData): Promise<State> {
  // 1. Validate form data
   const validatedFields = SchoolSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  const { confirmPassword, ...schoolData } = validatedFields.data;

  try {
    // 2. Read existing schools
    const db = await readDb();
    
    // 3. Check if schoolId or email already exists
    const existingSchoolByEmail = db.schools.find((s: any) => s.contactEmail === schoolData.contactEmail);
    if (existingSchoolByEmail) {
      return { message: 'This email is already registered.' };
    }

    // 4. Add new school (in a real app, hash the password here!)
    db.schools.push(schoolData);

    // 5. Write back to the database
    await writeDb(db);

    // 6. Return success state
    return { message: 'School created successfully!', data: { schoolId: schoolData.schoolId } };

  } catch (e: any) {
    return {
      message: `Database error: ${e.message}`,
    };
  }
}
