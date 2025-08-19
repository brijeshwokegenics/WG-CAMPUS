
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, QueryConstraint, setDoc, and, or, documentId, orderBy,getCountFromServer, limit, startAfter, DocumentSnapshot, endBefore } from 'firebase/firestore';
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
  parentId: z.string().optional(),
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

const PeriodSchema = z.object({
  subject: z.string().optional(),
  teacher: z.string().optional(),
});

const TimetableDaySchema = z.array(PeriodSchema);

const TimetableSchema = z.object({
    schoolId: z.string(),
    classId: z.string(),
    section: z.string(),
    monday: TimetableDaySchema,
    tuesday: TimetableDaySchema,
    wednesday: TimetableDaySchema,
    thursday: TimetableDaySchema,
    friday: TimetableDaySchema,
    saturday: TimetableDaySchema,
});

const ExamTermSchema = z.object({
    schoolId: z.string(),
    name: z.string().min(3, "Exam name must be at least 3 characters."),
    session: z.string().min(4, "Session is required, e.g., 2024-2025."),
});

const UpdateExamTermSchema = z.object({
    name: z.string().min(3, "Exam name must be at least 3 characters."),
    session: z.string().min(4, "Session is required, e.g., 2024-2025."),
});

const SubjectScheduleSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required."),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  maxMarks: z.number().min(1, "Max marks must be at least 1."),
});

const ExamScheduleSchema = z.object({
    schoolId: z.string(),
    examTermId: z.string(),
    classId: z.string(),
    subjects: z.array(SubjectScheduleSchema),
});

const StudentMarksSchema = z.object({
    subjectName: z.string(),
    marksObtained: z.number().optional(),
});

const MarksEntrySchema = z.object({
    schoolId: z.string(),
    examTermId: z.string(),
    classId: z.string(),
    section: z.string(),
    studentId: z.string(),
    marks: z.array(StudentMarksSchema),
});

const StudyMaterialSchema = z.object({
  schoolId: z.string().min(1),
  classId: z.string().min(1, "Class is required."),
  section: z.string().min(1, "Section is required."),
  date: z.date(),
  title: z.string().min(3, "Title is required."),
  description: z.string().optional(),
  fileUrl: z.string().url("A valid file URL is required.").optional().or(z.literal('')),
});

const UpdateStudyMaterialSchema = StudyMaterialSchema.omit({ schoolId: true }).extend({
  id: z.string().min(1),
});

const HomeworkObjectSchema = z.object({
  schoolId: z.string().min(1),
  classId: z.string().min(1, "Class is required."),
  section: z.string().min(1, "Section is required."),
  date: z.date(),
  submissionDate: z.date(),
  title: z.string().min(3, "Title is required."),
  description: z.string().optional(),
  fileUrl: z.string().url("A valid file URL is required.").optional().or(z.literal('')),
});

const HomeworkSchema = HomeworkObjectSchema.refine(data => data.submissionDate >= data.date, {
  message: "Submission date cannot be before the assignment date.",
  path: ["submissionDate"],
});

const UpdateHomeworkSchema = HomeworkObjectSchema.omit({ schoolId: true }).extend({
    id: z.string().min(1),
}).refine(data => data.submissionDate >= data.date, {
    message: "Submission date cannot be before the assignment date.",
    path: ["submissionDate"],
});


export async function getDashboardSummary(schoolId: string) {
    if (!schoolId) {
        return { success: false, error: 'School ID is required.' };
    }
    try {
        const studentsQuery = query(collection(db, 'students'), where('schoolId', '==', schoolId));
        const staffQuery = query(collection(db, 'users'), where('schoolId', '==', schoolId));
        const classesQuery = query(collection(db, 'classes'), where('schoolId', '==', schoolId));
        
        const [studentsSnapshot, staffSnapshot, classesSnapshot] = await Promise.all([
            getCountFromServer(studentsQuery),
            getCountFromServer(staffQuery),
            getCountFromServer(classesQuery)
        ]);
        
        return {
            success: true,
            data: {
                totalStudents: studentsSnapshot.data().count,
                totalStaff: staffSnapshot.data().count,
                totalClasses: classesSnapshot.data().count,
            }
        };

    } catch(error) {
        console.error("Error fetching dashboard summary:", error);
        return { success: false, error: "Failed to fetch dashboard summary." };
    }
}

export async function getClassesForSchool(schoolId: string) {
  if (!schoolId) {
    return { success: false, error: 'School ID is required.' };
  }

  try {
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: true, data: [] };
    }

    const classes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as { id: string; name: string; sections: string[]; schoolId: string }[];
    
    // Perform a safe sort in code
    classes.sort((a, b) => {
      if (a.name && b.name) {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      }
      return 0; // if name is missing, don't sort
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
      let parentId = parsed.data.parentId;

      // If no parentId is provided, create a new parent user
      if (!parentId) {
          const usersRef = collection(db, 'users');
          const parentUserId = parsed.data.parentMobile;

          // Check if a parent with this mobile number already exists
          const q = query(usersRef, where('schoolId', '==', schoolId), where('userId', '==', parentUserId));
          const existingParent = await getDocs(q);

          if (existingParent.empty) {
              const newParentData = {
                  schoolId: schoolId,
                  name: `${parsed.data.studentName}'s Parent`,
                  email: parsed.data.parentEmail || '',
                  phone: parsed.data.parentMobile,
                  role: 'Parent',
                  userId: parentUserId,
                  password: parentUserId, // Set password to mobile number by default
                  enabled: true,
              };
              const newParentRef = await addDoc(usersRef, newParentData);
              parentId = newParentRef.id;
          } else {
              parentId = existingParent.docs[0].id;
          }
      }

      const studentDataToSave = {
          ...parsed.data,
          parentId: parentId, // Add the parentId to the student document
      };

      const studentsRef = collection(db, 'students');
      const newStudentRef = await addDoc(studentsRef, studentDataToSave);
      
      revalidatePath(`/director/dashboard/${schoolId}/academics/admissions`);
      revalidatePath(`/director/dashboard/${schoolId}/academics/students`);

      const newStudentDoc = await getDoc(newStudentRef);
      const newStudentData = {
          id: newStudentDoc.id,
          ...newStudentDoc.data(),
      };
      
      const parentUserId = parsed.data.parentMobile;
      const successMessage = `Student admitted successfully with ID: ${newStudentRef.id}. Parent login created - User ID: ${parentUserId}, Password: ${parentUserId}`;

      return { 
          success: true, 
          message: successMessage,
          student: newStudentData,
      };
  } catch (error) {
      console.error('Error admitting student:', error);
      return { success: false, error: 'An unexpected error occurred during admission.' };
  }
}

// Helper function to fetch docs in batches
async function getDocsInBatches(ids: string[], collectionName: string) {
    if (ids.length === 0) return new Map();
    const docMap = new Map();
    const idChunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        idChunks.push(ids.slice(i, i + 30));
    }
    for (const chunk of idChunks) {
        const q = query(collection(db, collectionName), where(documentId(), 'in', chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => docMap.set(doc.id, doc.data()));
    }
    return docMap;
}

export async function getStudentsForSchool({ schoolId, searchTerm, admissionId, classId, section, passedOnly, rowsPerPage = 1000 }: { schoolId: string, searchTerm?: string, admissionId?: string, classId?: string, section?: string, passedOnly?: boolean, rowsPerPage?: number }) {
    if (!schoolId) {
        return [];
    }

    try {
        let queryConstraints: QueryConstraint[] = [where('schoolId', '==', schoolId)];

        if (classId) queryConstraints.push(where('classId', '==', classId));
        if (section) queryConstraints.push(where('section', '==', section));
        if (passedOnly) queryConstraints.push(where('passedFinalExam', '==', true));
        
        let studentsQuery = query(collection(db, 'students'), ...queryConstraints, orderBy('studentName'), limit(rowsPerPage));
        
        const studentsSnapshot = await getDocs(studentsQuery);
        let allStudents = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (searchTerm || admissionId) {
            const lowercasedTerm = searchTerm?.toLowerCase() || '';
            allStudents = allStudents.filter(s => {
                const nameMatch = lowercasedTerm ? (s.studentName as string).toLowerCase().includes(lowercasedTerm) : false;
                const fatherNameMatch = lowercasedTerm ? (s.fatherName as string).toLowerCase().includes(lowercasedTerm) : false;
                const admissionIdMatch = admissionId ? s.id === admissionId : false;
                
                if (admissionId) return admissionIdMatch;
                if (searchTerm) return nameMatch || fatherNameMatch;
                return true;
            });
        }
        
        if (allStudents.length === 0) {
            return [];
        }

        const classIds = [...new Set(allStudents.map(s => s.classId))];
        const classMap = await getDocsInBatches(classIds, 'classes');

        const studentData = allStudents.map(s => ({
            id: s.id,
            studentName: s.studentName,
            className: classMap.get(s.classId)?.name || 'N/A',
            section: s.section,
            fatherName: s.fatherName,
            parentMobile: s.parentMobile,
            feesPaid: s.feesPaid || false,
            passedFinalExam: s.passedFinalExam || false,
        }));

        return studentData;

    } catch (error) {
        console.error("Error fetching students:", error);
        return [];
    }
}


export async function getStudentCountForSchool({ schoolId, searchTerm, admissionId, classId, section, passedOnly }: { schoolId: string, searchTerm?: string, admissionId?: string, classId?: string, section?: string, passedOnly?: boolean }) {
     if (!schoolId) {
        return 0;
    }

    try {
        let queryConstraints: QueryConstraint[] = [where('schoolId', '==', schoolId)];
        if (admissionId) return 1;
        if (classId) queryConstraints.push(where('classId', '==', classId));
        if (section) queryConstraints.push(where('section', '==', section));
        if (passedOnly) queryConstraints.push(where('passedFinalExam', '==', true));
        if (searchTerm) {
            const endTerm = searchTerm.slice(0, -1) + String.fromCharCode(searchTerm.charCodeAt(searchTerm.length - 1) + 1);
            queryConstraints.push(where('studentName', '>=', searchTerm));
            queryConstraints.push(where('studentName', '<', endTerm));
        }
        
        const studentsQuery = query(collection(db, 'students'), ...queryConstraints);
        const totalSnapshot = await getCountFromServer(studentsQuery);
        return totalSnapshot.data().count;

    } catch (error) {
        console.error("Error fetching student count:", error);
        return 0;
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
            id: studentDoc.id,
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
        const studentResult = await getStudentsForSchool({ schoolId, classId, section });
        if (studentResult.length === 0) {
            return { success: true, data: { students: [], attendance: [] } };
        }
        const students = studentResult;


        const attendanceRef = collection(db, 'attendance');
        // Firestore limitation: Cannot have inequality filters on multiple fields.
        // We will query for the class and date range, then filter by section in code.
        const q = query(attendanceRef,
            where('schoolId', '==', schoolId),
            where('classId', '==', classId),
            where('date', '>=', format(startDate, 'yyyy-MM-dd')),
            where('date', '<=', format(endDate, 'yyyy-MM-dd'))
        );

        const querySnapshot = await getDocs(q);
        
        // Filter by section in the code
        const attendanceRecords = querySnapshot.docs
            .map(doc => doc.data())
            .filter(data => data.section === section);
        
        return { success: true, data: { students, attendance: attendanceRecords } };

    } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        return { success: false, error: 'Failed to fetch monthly attendance data.' };
    }
}

export async function saveTimetable(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        classId: formData.get('classId'),
        section: formData.get('section'),
        monday: JSON.parse(formData.get('monday') as string),
        tuesday: JSON.parse(formData.get('tuesday') as string),
        wednesday: JSON.parse(formData.get('wednesday') as string),
        thursday: JSON.parse(formData.get('thursday') as string),
        friday: JSON.parse(formData.get('friday') as string),
        saturday: JSON.parse(formData.get('saturday') as string),
    };

    const parsed = TimetableSchema.safeParse(rawData);

    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: 'Invalid timetable data provided.', details: parsed.error.flatten() };
    }

    const { schoolId, classId, section } = parsed.data;
    const docId = `${schoolId}_${classId}_${section}`;

    try {
        const timetableRef = doc(db, 'timetables', docId);
        await setDoc(timetableRef, parsed.data, { merge: true });

        revalidatePath(`/director/dashboard/${schoolId}/academics/timetable`);
        return { success: true, message: 'Timetable saved successfully!' };

    } catch (error) {
        console.error('Error saving timetable:', error);
        return { success: false, error: 'An unexpected error occurred while saving the timetable.' };
    }
}

export async function getTimetable({ schoolId, classId, section }: { schoolId: string, classId: string, section: string }) {
    if (!schoolId || !classId || !section) {
        return { success: false, error: 'Missing required fields to fetch timetable.' };
    }

    const docId = `${schoolId}_${classId}_${section}`;

    try {
        const timetableRef = doc(db, 'timetables', docId);
        const docSnap = await getDoc(timetableRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: true, data: null }; // No record found is not an error
        }
    } catch (error) {
        console.error('Error fetching timetable:', error);
        return { success: false, error: 'Failed to fetch timetable data.' };
    }
}


export async function createExamTerm(prevState: any, formData: FormData) {
    const parsed = ExamTermSchema.safeParse({
        schoolId: formData.get('schoolId'),
        name: formData.get('name'),
        session: formData.get('session'),
    });

    if (!parsed.success) {
        return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    }

    try {
        await addDoc(collection(db, 'examTerms'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/academics/exams`);
        return { success: true, message: "Exam term created successfully." };
    } catch (error) {
        console.error("Error creating exam term:", error);
        return { success: false, error: "Failed to create exam term." };
    }
}

export async function getExamTerms(schoolId: string) {
    try {
        const q = query(collection(db, 'examTerms'), where('schoolId', '==', schoolId));
        const snapshot = await getDocs(q);
        const terms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: terms };
    } catch (error) {
        console.error("Error fetching exam terms:", error);
        return { success: false, error: "Failed to fetch exam terms." };
    }
}

export async function updateExamTerm(prevState: any, formData: FormData) {
    const examTermId = formData.get('examTermId') as string;
    const schoolId = formData.get('schoolId') as string;

    if (!examTermId || !schoolId) {
        return { success: false, error: 'Exam Term ID and School ID are required.' };
    }

    const parsed = UpdateExamTermSchema.safeParse({
        name: formData.get('name'),
        session: formData.get('session'),
    });

    if (!parsed.success) {
        return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    }
    
    try {
        const termDocRef = doc(db, 'examTerms', examTermId);
        
        const termDoc = await getDoc(termDocRef);
        if (!termDoc.exists() || termDoc.data().schoolId !== schoolId) {
            return { success: false, error: "Exam term not found or permission denied." };
        }

        await updateDoc(termDocRef, parsed.data);

        revalidatePath(`/director/dashboard/${schoolId}/academics/exams`);
        return { success: true, message: 'Exam term updated successfully!' };
    } catch (error) {
        console.error('Error updating exam term:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function updateExamSchedule(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        examTermId: formData.get('examTermId'),
        classId: formData.get('classId'),
        subjects: JSON.parse(formData.get('subjects') as string),
    };
    
    // Convert date strings to Date objects
    rawData.subjects.forEach((sub: any) => {
        sub.date = new Date(sub.date);
        sub.maxMarks = Number(sub.maxMarks) || 0;
    });

    const parsed = ExamScheduleSchema.safeParse(rawData);

    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: "Invalid schedule data.", details: parsed.error.flatten() };
    }
    
    const { schoolId, examTermId, classId } = parsed.data;
    const docId = `${schoolId}_${examTermId}_${classId}`;

    try {
        await setDoc(doc(db, 'examSchedules', docId), parsed.data, { merge: true });
        revalidatePath(`/director/dashboard/${schoolId}/academics/exams`);
        return { success: true, message: "Exam schedule updated successfully." };
    } catch (error) {
        console.error("Error updating exam schedule:", error);
        return { success: false, error: "Failed to update schedule." };
    }
}

export async function getExamSchedule(schoolId: string, examTermId: string, classId: string) {
     if (!schoolId || !examTermId || !classId) {
        return { success: false, error: "Missing required fields." };
    }
    const docId = `${schoolId}_${examTermId}_${classId}`;
    try {
        const docRef = doc(db, 'examSchedules', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
             const data = docSnap.data();
             // Convert firestore timestamps back to dates for the form
             const subjects = data.subjects.map((s:any) => ({...s, date: s.date.toDate()}));
            return { success: true, data: {...data, subjects} };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error("Error fetching exam schedule:", error);
        return { success: false, error: "Failed to fetch schedule." };
    }
}

export async function saveMarks(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        examTermId: formData.get('examTermId'),
        classId: formData.get('classId'),
        section: formData.get('section'),
        studentId: formData.get('studentId'),
        marks: JSON.parse(formData.get('marks') as string),
    };

    rawData.marks.forEach((m: any) => {
       m.marksObtained = m.marksObtained !== '' ? Number(m.marksObtained) : undefined;
    });

    const parsed = MarksEntrySchema.safeParse(rawData);

    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: "Invalid marks data.", details: parsed.error.flatten() };
    }

    const { schoolId, examTermId, studentId } = parsed.data;
    const docId = `${schoolId}_${examTermId}_${studentId}`;

    try {
        await setDoc(doc(db, 'marks', docId), parsed.data, { merge: true });
        revalidatePath(`/director/dashboard/${schoolId}/academics/exams`);
        return { success: true, message: "Marks saved successfully." };
    } catch (error) {
        console.error("Error saving marks:", error);
        return { success: false, error: "Failed to save marks." };
    }
}

export async function getMarksForStudent(schoolId: string, examTermId: string, studentId: string) {
    if (!schoolId || !examTermId || !studentId) {
        return { success: false, error: "Missing required fields." };
    }
    const docId = `${schoolId}_${examTermId}_${studentId}`;
    try {
        const docRef = doc(db, 'marks', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().schoolId === schoolId) {
            return { success: true, data: docSnap.data() };
        }
        return { success: true, data: null };
    } catch (error) {
        console.error("Error fetching marks:", error);
        return { success: false, error: "Failed to fetch marks." };
    }
}

export async function addStudyMaterial(prevState: any, formData: FormData) {
  const rawData = {
    ...Object.fromEntries(formData.entries()),
    date: new Date(formData.get('date') as string),
  };
  const parsed = StudyMaterialSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { success: false, error: 'Invalid data provided for study material.' };
  }

  try {
    await addDoc(collection(db, 'studyMaterials'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/academics/elearning`);
    return { success: true, message: 'Study material added successfully.' };
  } catch (error) {
    console.error('Error adding study material:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function getStudyMaterials({ schoolId, classId, section }: { schoolId: string; classId: string; section: string }) {
  try {
    const q = query(
      collection(db, 'studyMaterials'),
      where('schoolId', '==', schoolId),
      where('classId', '==', classId),
      where('section', '==', section)
    );
    const snapshot = await getDocs(q);
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
    }));
    return { success: true, data: materials };
  } catch (error) {
    console.error('Error fetching study materials:', error);
    return { success: false, error: 'Failed to fetch study materials.' };
  }
}

export async function updateStudyMaterial(prevState: any, formData: FormData) {
    const rawData = {
        ...Object.fromEntries(formData.entries()),
        date: new Date(formData.get('date') as string),
    };
    const parsed = UpdateStudyMaterialSchema.safeParse(rawData);

    if (!parsed.success) {
        console.error(parsed.error.flatten());
        return { success: false, error: 'Invalid data for updating study material.' };
    }

    const { id, ...updateData } = parsed.data;
    const schoolId = formData.get('schoolId') as string;

    try {
        const docRef = doc(db, 'studyMaterials', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Permission denied." };
        }
        await updateDoc(docRef, updateData);
        revalidatePath(`/director/dashboard/${schoolId}/academics/elearning`);
        return { success: true, message: 'Study material updated successfully.' };
    } catch (error) {
        console.error('Error updating study material:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function deleteStudyMaterial({ id, schoolId }: { id: string; schoolId: string }) {
    try {
        const docRef = doc(db, 'studyMaterials', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Permission denied." };
        }
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/academics/elearning`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting study material:', error);
        return { success: false, error: 'Failed to delete study material.' };
    }
}


export async function addHomework(prevState: any, formData: FormData) {
  const rawData = {
    ...Object.fromEntries(formData.entries()),
    date: new Date(formData.get('date') as string),
    submissionDate: new Date(formData.get('submissionDate') as string),
  };
  const parsed = HomeworkSchema.safeParse(rawData);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { success: false, error: 'Invalid data provided for homework.', details: parsed.error.flatten() };
  }

  try {
    await addDoc(collection(db, 'homework'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/academics/elearning`);
    return { success: true, message: 'Homework added successfully.' };
  } catch (error) {
    console.error('Error adding homework:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function getHomework({ schoolId, classId, section }: { schoolId: string; classId: string; section: string }) {
  try {
    const q = query(
      collection(db, 'homework'),
      where('schoolId', '==', schoolId),
      where('classId', '==', classId),
      where('section', '==', section)
    );
    const snapshot = await getDocs(q);
    const homeworks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      submissionDate: doc.data().submissionDate.toDate(),
    }));
    return { success: true, data: homeworks };
  } catch (error) {
    console.error('Error fetching homework:', error);
    return { success: false, error: 'Failed to fetch homework.' };
  }
}

export async function updateHomework(prevState: any, formData: FormData) {
    const rawData = {
        ...Object.fromEntries(formData.entries()),
        date: new Date(formData.get('date') as string),
        submissionDate: new Date(formData.get('submissionDate') as string),
    };
    const parsed = UpdateHomeworkSchema.safeParse(rawData);

    if (!parsed.success) {
        console.error(parsed.error.flatten());
        return { success: false, error: 'Invalid data for updating homework.', details: parsed.error.flatten() };
    }
    
    const { id, ...updateData } = parsed.data;
    const schoolId = formData.get('schoolId') as string;

    try {
        const docRef = doc(db, 'homework', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Permission denied." };
        }
        await updateDoc(docRef, updateData);
        revalidatePath(`/director/dashboard/${schoolId}/academics/elearning`);
        return { success: true, message: 'Homework updated successfully.' };
    } catch (error) {
        console.error('Error updating homework:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function deleteHomework({ id, schoolId }: { id: string; schoolId: string }) {
    try {
        const docRef = doc(db, 'homework', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Permission denied." };
        }
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/academics/elearning`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting homework:', error);
        return { success: false, error: 'Failed to delete homework.' };
    }
}

    