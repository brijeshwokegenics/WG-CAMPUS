
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, documentId } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// ========== VEHICLES ==========
const VehicleSchema = z.object({
  schoolId: z.string(),
  vehicleNumber: z.string().min(3, "Vehicle number is required."),
  model: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
});
const UpdateVehicleSchema = VehicleSchema.omit({ schoolId: true });

export async function createVehicle(prevState: any, formData: FormData) {
  const parsed = VehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data', details: parsed.error.flatten() };
  try {
    const q = query(collection(db, 'transportVehicles'), where('schoolId', '==', parsed.data.schoolId), where('vehicleNumber', '==', parsed.data.vehicleNumber));
    const existing = await getDocs(q);
    if (!existing.empty) return { success: false, error: 'A vehicle with this number already exists.' };

    await addDoc(collection(db, 'transportVehicles'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/transport`);
    return { success: true, message: 'Vehicle added successfully.' };
  } catch (e) { return { success: false, error: 'Failed to create vehicle.' }; }
}

export async function getVehicles(schoolId: string) {
  const q = query(collection(db, 'transportVehicles'), where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  vehicles.sort((a,b) => a.vehicleNumber.localeCompare(b.vehicleNumber));
  return vehicles;
}

export async function updateVehicle(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = UpdateVehicleSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data', details: parsed.error.flatten() };
    try {
        const docRef = doc(db, 'transportVehicles', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true, message: 'Vehicle updated successfully.' };
    } catch (e) { return { success: false, error: 'Failed to update vehicle.' }; }
}

export async function deleteVehicle(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'transportVehicles', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to delete vehicle.'}; }
}

// ========== ROUTES & STOPS ==========
const StopSchema = z.object({
  name: z.string().min(2, 'Stop name is required.'),
  fee: z.coerce.number().min(0).default(0),
});

const RouteSchema = z.object({
  schoolId: z.string(),
  name: z.string().min(3, "Route name is required."),
  vehicleId: z.string().optional(),
  stops: z.array(StopSchema).min(1, "At least one stop is required."),
});

const UpdateRouteSchema = RouteSchema.omit({ schoolId: true });

export async function createRoute(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        name: formData.get('name'),
        vehicleId: formData.get('vehicleId'),
        stops: JSON.parse(formData.get('stops') as string),
    };
    const parsed = RouteSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    try {
        await addDoc(collection(db, 'transportRoutes'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/transport`);
        return { success: true, message: 'Route created successfully.'};
    } catch (e) { return { success: false, error: 'Failed to create route.'}; }
}

export async function getRoutes(schoolId: string) {
    const q = query(collection(db, 'transportRoutes'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const routes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    routes.sort((a,b) => (a.name as string).localeCompare(b.name as string));
    return routes;
}

export async function updateRoute(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const rawData = {
        name: formData.get('name'),
        vehicleId: formData.get('vehicleId'),
        stops: JSON.parse(formData.get('stops') as string),
    };
    const parsed = UpdateRouteSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    try {
        const docRef = doc(db, 'transportRoutes', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true, message: 'Route updated successfully.' };
    } catch(e) { return { success: false, error: 'Failed to update route.'}; }
}

export async function deleteRoute(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'transportRoutes', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to delete route.'}; }
}

// ========== STUDENT ALLOCATION ==========
const StudentTransportSchema = z.object({
    schoolId: z.string(),
    studentId: z.string(),
    routeId: z.string(),
    stopName: z.string(),
});

export async function assignStudentsToRoute(schoolId: string, routeId: string, stopName: string, studentIds: string[]) {
    if (!schoolId || !routeId || !stopName || studentIds.length === 0) {
        return { success: false, error: 'Missing required information for student assignment.' };
    }
    
    try {
        const batch = writeBatch(db);
        studentIds.forEach(studentId => {
            const docRef = doc(db, 'studentTransport', `${schoolId}_${studentId}`);
            batch.set(docRef, { schoolId, studentId, routeId, stopName });
        });
        await batch.commit();
        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true, message: `${studentIds.length} student(s) assigned successfully.` };
    } catch (e) {
        return { success: false, error: 'Failed to assign students.' };
    }
}

export async function getAssignedStudents(schoolId: string, routeId?: string) {
    const constraints = routeId
        ? [where('schoolId', '==', schoolId), where('routeId', '==', routeId)]
        : [where('schoolId', '==', schoolId)];

    const q = query(collection(db, 'studentTransport'), ...constraints);
    
    const assignmentsSnapshot = await getDocs(q);
    if (assignmentsSnapshot.empty) {
        return [];
    }

    const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as z.infer<typeof StudentTransportSchema> }));

    // Get unique student IDs from the assignments
    const studentIds = [...new Set(assignments.map(a => a.studentId))];
    if (studentIds.length === 0) {
        return [];
    }
    
    const studentDataMap = new Map<string, any>();
    const studentIdChunks: string[][] = [];
    for (let i = 0; i < studentIds.length; i += 30) {
        studentIdChunks.push(studentIds.slice(i, i + 30));
    }

    for (const chunk of studentIdChunks) {
        if (chunk.length > 0) {
            const studentsQuery = query(collection(db, 'students'), where(documentId(), 'in', chunk));
            const studentsSnapshot = await getDocs(studentsQuery);
            studentsSnapshot.forEach(doc => {
                if (doc.data().schoolId === schoolId) {
                    studentDataMap.set(doc.id, doc.data());
                }
            });
        }
    }
    
    const classIds = [...new Set(Array.from(studentDataMap.values()).map(student => student.classId).filter(Boolean))];
    const classDataMap = new Map<string, string>();
    if(classIds.length > 0) {
        const classesQuery = query(collection(db, 'classes'), where(documentId(), 'in', classIds));
        const classesSnapshot = await getDocs(classesQuery);
        classesSnapshot.forEach(doc => {
            if (doc.data().schoolId === schoolId) {
                classDataMap.set(doc.id, doc.data().name);
            }
        });
    }

    const populatedAssignments = assignments.map(assignment => {
        const studentInfo = studentDataMap.get(assignment.studentId);
        if (!studentInfo) return null;

        return {
            ...assignment,
            studentName: studentInfo.studentName,
            className: classDataMap.get(studentInfo.classId) || 'N/A',
            section: studentInfo.section,
        };
    }).filter(Boolean);

    return populatedAssignments as any[];
}


export async function unassignStudent(id: string, schoolId: string) {
     try {
        const docRef = doc(db, 'studentTransport', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to unassign student.'}; }
}

export async function updateStudentAssignment(schoolId: string, assignmentId: string, newRouteId: string, newStopName: string) {
    if (!schoolId || !assignmentId || !newRouteId || !newStopName) {
        return { success: false, error: 'Missing required information for updating assignment.' };
    }

    try {
        const assignmentDocRef = doc(db, 'studentTransport', assignmentId);
        
        // Security check
        const docSnap = await getDoc(assignmentDocRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Assignment not found or permission denied." };
        }

        await updateDoc(assignmentDocRef, {
            routeId: newRouteId,
            stopName: newStopName,
        });

        revalidatePath(`/director/dashboard/${schoolId}/admin/transport`);
        return { success: true, message: 'Student assignment updated successfully.' };
    } catch (e) {
        console.error("Error updating student assignment:", e);
        return { success: false, error: 'Failed to update assignment.' };
    }
}


export async function getStudentTransportAssignment(schoolId: string, studentId: string) {
    try {
        const docRef = doc(db, 'studentTransport', `${schoolId}_${studentId}`);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: true, data: null };
        }
        
        const assignment = docSnap.data() as z.infer<typeof StudentTransportSchema>;
        
        const routeDocRef = doc(db, 'transportRoutes', assignment.routeId);
        const routeDocSnap = await getDoc(routeDocRef);
        
        if (!routeDocSnap.exists()) {
             return { success: false, error: "Assigned route not found." };
        }
        
        const routeData = routeDocSnap.data() as z.infer<typeof RouteSchema>;
        const stopData = routeData.stops.find(s => s.name === assignment.stopName);

        if (!stopData) {
            return { success: false, error: "Assigned stop not found on the route." };
        }

        return {
            success: true,
            data: {
                fee: stopData.fee,
                stopName: stopData.name,
                routeName: routeData.name,
            }
        }

    } catch (error) {
        console.error("Error fetching student transport assignment:", error);
        return { success: false, error: 'Failed to fetch transport details.' };
    }
}
    
