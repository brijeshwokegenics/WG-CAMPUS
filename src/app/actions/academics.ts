
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, QueryConstraint, setDoc, and, or } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { startOfMonth, endOfMonth, format } from 'date-fns';

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
  feesPaid: z.boolean().default(false).optional(),
  passedFinalExam: z.boolean().default(false).optional(),
  currentSession: z.string().optional(),
});

const UpdateStudentSchema = StudentSchema.omit({schoolId: true});

const PromoteStudentSchema = z.object({
    schoolId: z.string(),
    fromClassId: z.string(),
    toClassId: z.string(),
    toSection: z.string(),
    studentIds: z.array(z.string()).min(1, "Please select at least one student to promote."),
});

const AttendanceStatusSchema = z.enum(["Present", "Absent", "Late", "Half Day"]);
const StudentAttendanceSchema = z.record(z.string(), AttendanceStatusSchema);

const AttendanceSchema = z.object({
    schoolId: z.string(),
    classId: z.string(),
    section: z.string(),
    date: z.string(), // YYYY-MM-DD
    attendance: StudentAttendanceSchema,
});


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
  
  // Convert date strings to Date objects
  const dataWithDates = {
      ...rawData,
      admissionDate: new Date(rawData.admissionDate as string),
      dob: new Date(rawData.dob as string),
      feesPaid: rawData.feesPaid === 'true',
      passedFinalExam: rawData.passedFinalExam === 'true',
  };
  
  // Remove empty optional fields so they don't fail validation
  for (const key in dataWithDates) {
    if (dataWithDates[key] === '') {
      delete (dataWithDates as any)[key];
    }
  }

  const parsed = StudentSchema.safeParse(dataWithDates);

  if (!parsed.success) {
      console.log(parsed.error.flatten());
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

export async function getStudentsForSchool({ schoolId, name, admissionId, classId, section, passedOnly }: { schoolId: string, name?: string, admissionId?: string, classId?: string, section?: string, passedOnly?: boolean }) {
    if (!schoolId) {
        console.error("School ID is required.");
        return [];
    }
    
    try {
        const studentsRef = collection(db, 'students');
        const queryConstraints: QueryConstraint[] = [where('schoolId', '==', schoolId)];

        if (classId) {
            queryConstraints.push(where('classId', '==', classId));
        }
        if (section) {
            queryConstraints.push(where('section', '==', section));
        }
        if (passedOnly) {
            queryConstraints.push(where('passedFinalExam', '==', true));
        }

        let studentsQuery = query(studentsRef, ...queryConstraints);
        const studentsSnapshot = await getDocs(studentsQuery);

        if (studentsSnapshot.empty) {
            return [];
        }

        const classCache = new Map();
        const getClassName = async (cId: string) => {
            if (classCache.has(cId)) {
                return classCache.get(cId);
            }
            if (!cId) return 'N/A';
            const classDocRef = doc(db, 'classes', cId);
            const classDoc = await getDoc(classDocRef);
            if (classDoc.exists() && classDoc.data().schoolId === schoolId) {
                const className = classDoc.data().name;
                classCache.set(cId, className);
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
                feesPaid: data.feesPaid || false,
                passedFinalExam: data.passedFinalExam || false,
            };
        }));
        
        // Manual client-side filtering for non-indexed fields (name, admissionId)
        if (name) {
            studentsData = studentsData.filter(student =>
                student.studentName.toLowerCase().includes(name.toLowerCase())
            );
        }
        if (admissionId) {
            studentsData = studentsData.filter(student =>
                student.id.toLowerCase().includes(admissionId.toLowerCase())
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
      feesPaid: rawData.feesPaid === 'on' || rawData.feesPaid === 'true',
      passedFinalExam: rawData.passedFinalExam === 'on' || rawData.passedFinalExam === 'true',
  };

  // Remove empty optional fields so they don't fail validation
  for (const key in dataWithDates) {
    if (dataWithDates[key] === '' || dataWithDates[key] === null) {
      delete (dataWithDates as any)[key];
    }
  }


  const parsed = UpdateStudentSchema.safeParse(dataWithDates);

  if (!parsed.success) {
      console.log(parsed.error.flatten());
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


export async function promoteStudents(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        fromClassId: formData.get('fromClassId'),
        toClassId: formData.get('toClassId'),
        toSection: formData.get('toSection'),
        studentIds: formData.getAll('studentIds'),
    };

    const parsed = PromoteStudentSchema.safeParse(rawData);

    if (!parsed.success) {
        return { success: false, error: "Invalid data provided.", details: parsed.error.flatten() };
    }
    
    const { schoolId, toClassId, toSection, studentIds } = parsed.data;

    try {
        const batch = writeBatch(db);

        studentIds.forEach(studentId => {
            const studentDocRef = doc(db, 'students', studentId);
            batch.update(studentDocRef, {
                classId: toClassId,
                section: toSection,
                passedFinalExam: false, // Reset for the new session
            });
        });

        await batch.commit();

        revalidatePath(`/director/dashboard/${schoolId}/academics/students`);
        revalidatePath(`/director/dashboard/${schoolId}/academics/promote`);
        
        return { success: true, message: `Successfully promoted ${studentIds.length} students.` };

    } catch (error) {
        console.error("Error promoting students:", error);
        return { success: false, error: "An unexpected error occurred while promoting students." };
    }
}

export async function saveStudentAttendance(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        classId: formData.get('classId'),
        section: formData.get('section'),
        date: formData.get('date'),
        attendance: JSON.parse(formData.get('attendance') as string),
    };

    const parsed = AttendanceSchema.safeParse(rawData);
    
    if (!parsed.success) {
        return { success: false, error: 'Invalid data provided for attendance.', details: parsed.error.flatten() };
    }

    const { schoolId, classId, section, date, attendance } = parsed.data;
    const docId = `${schoolId}_${classId}_${section}_${date}`;

    try {
        const attendanceRef = doc(db, 'attendance', docId);
        await setDoc(attendanceRef, { schoolId, classId, section, date, attendance });
        
        revalidatePath(`/director/dashboard/${schoolId}/academics/attendance`);
        return { success: true, message: 'Attendance saved successfully!' };

    } catch (error) {
        console.error('Error saving attendance:', error);
        return { success: false, error: 'An unexpected error occurred while saving attendance.' };
    }
}

export async function getStudentAttendance({ schoolId, classId, section, date }: { schoolId: string, classId: string, section: string, date: string }) {
    if (!schoolId || !classId || !section || !date) {
        return { success: false, error: 'Missing required fields to fetch attendance.' };
    }
    
    const docId = `${schoolId}_${classId}_${section}_${date}`;
    
    try {
        const attendanceRef = doc(db, 'attendance', docId);
        const docSnap = await getDoc(attendanceRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data().attendance };
        } else {
            return { success: true, data: null }; // No record found for this date is not an error
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return { success: false, error: 'Failed to fetch attendance data.' };
    }
}

export async function getMonthlyAttendance({ schoolId, classId, section, month }: { schoolId: string, classId: string, section: string, month: string }) {
    if (!schoolId || !classId || !section || !month) {
        return { success: false, error: 'Missing required fields to fetch attendance report.' };
    }

    try {
        const [year, monthIndex] = month.split('-').map(Number);
        const startDate = startOfMonth(new Date(year, monthIndex - 1));
        const endDate = endOfMonth(new Date(year, monthIndex - 1));

        // Get all students for the class and section first
        const students = await getStudentsForSchool({ schoolId, classId, section });
        if (students.length === 0) {
            return { success: true, data: { students: [], attendance: [] } };
        }

        const attendanceRef = collection(db, 'attendance');
        const q = query(attendanceRef, and(
            where('schoolId', '==', schoolId),
            where('classId', '==', classId),
            where('section', '==', section),
            where('date', '>=', format(startDate, 'yyyy-MM-dd')),
            where('date', '<=', format(endDate, 'yyyy-MM-dd'))
        ));

        const querySnapshot = await getDocs(q);
        const attendanceRecords = querySnapshot.docs.map(doc => doc.data());
        
        return { success: true, data: { students, attendance: attendanceRecords } };

    } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        return { success: false, error: 'Failed to fetch monthly attendance data.' };
    }
}
