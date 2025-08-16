
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

const ClassSchema = z.object({
  name: z.string().min(1, 'Class name cannot be empty.'),
  sections: z.array(z.string().min(1, 'Section name cannot be empty.')).min(1, 'At least one section is required.'),
  schoolId: z.string().min(1, 'School ID is required.'),
});

// For updates, the schoolId is not part of the form, so we omit it from the update schema.
const UpdateClassSchema = ClassSchema.omit({ schoolId: true });

const StudentSchema = z.object({
  schoolId: z.string().min(1, "School ID is required."),
  classId: z.string().min(1, "Class is required."),
  section: z.string().min(1, "Section is required."),
  admissionDate: z.date(),
  studentName: z.string().min(2, "Student name must be at least 2 characters."),
  dob: z.date(),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.string().optional(),
  
  fatherName: z.string().min(2, "Father's name is required."),
  motherName: z.string().min(2, "Mother's name is required."),
  parentMobile: z.string().min(10, "A valid 10-digit mobile number is required."),
  parentEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
  
  address: z.string().min(5, "Address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  zipcode: z.string().min(5, "Zip code is required."),

  photoUrl: z.string().url().optional().or(z.literal('')),
  aadharUrl: z.string().url().optional().or(z.literal('')),
  birthCertificateUrl: z.string().url().optional().or(z.literal('')),

  // New Fields
  aadharNumber: z.string().optional(),
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  previousMarks: z.string().optional(),
  transportRequired: z.enum(['Yes', 'No']).optional(),
  hostelRequired: z.enum(['Yes', 'No']).optional(),
});

const UpdateStudentSchema = StudentSchema.omit({schoolId: true});


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

export async function admitStudent(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const dataWithDates = {
      ...rawData,
      admissionDate: new Date(rawData.admissionDate as string),
      dob: new Date(rawData.dob as string),
  };
  
  const parsed = StudentSchema.safeParse(dataWithDates);

  if (!parsed.success) {
      return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
  }

  const { schoolId } = parsed.data;

  try {
      const studentsRef = collection(db, 'students');
      
      const newStudentRef = await addDoc(studentsRef, parsed.data);
      
      revalidatePath(`/director/dashboard/${schoolId}/academics/admissions`);
      revalidatePath(`/director/dashboard/${schoolId}/academics/students`);

      return { success: true, message: `Student admitted successfully with ID: ${newStudentRef.id}` };
  } catch (error) {
      console.error('Error admitting student:', error);
      return { success: false, error: 'An unexpected error occurred during admission.' };
  }
}

export async function getStudentsForSchool(schoolId: string, searchTerm: string) {
    if (!schoolId) {
        console.error("School ID is required.");
        return [];
    }
    
    try {
        const studentsRef = collection(db, 'students');
        let studentsQuery = query(studentsRef, where('schoolId', '==', schoolId));
        
        const studentsSnapshot = await getDocs(studentsQuery);

        if (studentsSnapshot.empty) {
            return [];
        }

        const classCache = new Map();
        const getClassName = async (classId: string) => {
            if (classCache.has(classId)) {
                return classCache.get(classId);
            }
            if (!classId) return 'N/A';
            const classDocRef = doc(db, 'classes', classId);
            const classDoc = await getDoc(classDocRef);
            if (classDoc.exists() && classDoc.data().schoolId === schoolId) {
                const className = classDoc.data().name;
                classCache.set(classId, className);
                return className;
            }
            return 'N/A';
        };
        
        let studentsData = await Promise.all(studentsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const className = await getClassName(data.classId);
            return {
                id: doc.id,
                studentName: data.studentName,
                className: className,
                section: data.section,
                fatherName: data.fatherName,
                parentMobile: data.parentMobile,
            };
        }));

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            studentsData = studentsData.filter(student =>
                student.studentName.toLowerCase().includes(lowercasedTerm) ||
                student.id.toLowerCase().includes(lowercasedTerm) ||
                student.className.toLowerCase().includes(lowercasedTerm) ||
                student.fatherName.toLowerCase().includes(lowercasedTerm)
            );
        }

        return studentsData;
    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
}


export async function getStudentById(studentId: string, schoolId: string) {
    if (!studentId || !schoolId) {
        return { success: false, error: 'Student ID and School ID are required.' };
    }

    try {
        const studentDocRef = doc(db, 'students', studentId);
        const studentDoc = await getDoc(studentDocRef);

        if (!studentDoc.exists() || studentDoc.data().schoolId !== schoolId) {
            return { success: false, error: 'Student not found.' };
        }

        const studentData = studentDoc.data();
        
        // Fetch class name
        let className = 'N/A';
        if (studentData.classId) {
            const classDocRef = doc(db, 'classes', studentData.classId);
            const classDoc = await getDoc(classDocRef);
            if (classDoc.exists() && classDoc.data().schoolId === schoolId) {
                className = classDoc.data().name;
            }
        }
        
        // Convert Firestore Timestamps to Dates
        const dataWithDates = {
            ...studentData,
            admissionDate: studentData.admissionDate.toDate(),
            dob: studentData.dob.toDate(),
            className,
        };

        return { success: true, data: dataWithDates };
    } catch (error) {
        console.error('Error fetching student:', error);
        return { success: false, error: 'Failed to fetch student data.' };
    }
}


export async function updateStudent(prevState: any, formData: FormData) {
  const studentId = formData.get('studentId') as string;
  const schoolId = formData.get('schoolId') as string;
  
  if (!studentId || !schoolId) {
    return { success: false, error: 'Student ID and School ID are required.' };
  }

  const rawData = Object.fromEntries(formData.entries());
    const dataWithDates = {
      ...rawData,
      admissionDate: new Date(rawData.admissionDate as string),
      dob: new Date(rawData.dob as string),
  };

  const parsed = UpdateStudentSchema.safeParse(dataWithDates);

  if (!parsed.success) {
      return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
  }

  try {
    const studentDocRef = doc(db, 'students', studentId);

    // Security check
    const studentDoc = await getDoc(studentDocRef);
    if (!studentDoc.exists() || studentDoc.data().schoolId !== schoolId) {
        return { success: false, error: "Student not found or permission denied." };
    }

    await updateDoc(studentDocRef, parsed.data);
    
    revalidatePath(`/director/dashboard/${schoolId}/academics/students`);
    revalidatePath(`/director/dashboard/${schoolId}/academics/students/${studentId}`);

    return { success: true, message: 'Student profile updated successfully!' };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteStudent({ studentId, schoolId }: { studentId: string; schoolId: string }) {
    if (!studentId || !schoolId) {
        return { success: false, error: 'Student ID and School ID are required.' };
    }

    try {
        const studentDocRef = doc(db, 'students', studentId);

        const studentDoc = await getDoc(studentDocRef);
        if (!studentDoc.exists() || studentDoc.data().schoolId !== schoolId) {
            return { success: false, error: "Student not found or permission denied." };
        }
        
        await deleteDoc(studentDocRef);

        revalidatePath(`/director/dashboard/${schoolId}/academics/students`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting student:", error);
        return { success: false, error: "An unexpected error occurred while deleting the student." };
    }
}
