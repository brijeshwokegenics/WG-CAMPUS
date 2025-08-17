
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, serverTimestamp, orderBy, runTransaction, increment, documentId } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// ========== HOSTELS ==========
const HostelSchema = z.object({
  name: z.string().min(3, "Hostel name is required."),
  type: z.enum(['Boys', 'Girls', 'Mixed']),
  warden: z.string().optional(),
  schoolId: z.string(),
});
const UpdateHostelSchema = HostelSchema.omit({ schoolId: true });

export async function createHostel(prevState: any, formData: FormData) {
  const parsed = HostelSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data', details: parsed.error.flatten() };
  try {
    await addDoc(collection(db, 'hostels'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/hostel`);
    return { success: true, message: 'Hostel added successfully.' };
  } catch (e) { return { success: false, error: 'Failed to create hostel.' }; }
}

export async function getHostels(schoolId: string) {
  const q = query(collection(db, 'hostels'), where('schoolId', '==', schoolId));
  const snapshot = await getDocs(q);
  const hostels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  hostels.sort((a,b) => (a.name as string).localeCompare(b.name as string));
  return hostels;
}

export async function updateHostel(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = UpdateHostelSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data', details: parsed.error.flatten() };
    try {
        const docRef = doc(db, 'hostels', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
        return { success: true, message: 'Hostel updated successfully.' };
    } catch (e) { return { success: false, error: 'Failed to update hostel.' }; }
}

export async function deleteHostel(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'hostels', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        
        const batch = writeBatch(db);
        
        // Find and delete all rooms in the hostel
        const roomsQuery = query(collection(db, 'hostelRooms'), where('hostelId', '==', id));
        const roomsSnapshot = await getDocs(roomsQuery);
        roomsSnapshot.forEach(roomDoc => {
            batch.delete(roomDoc.ref);
        });
        
        // Find and delete all student assignments for this hostel
        const assignmentsQuery = query(collection(db, 'hostelAssignments'), where('hostelId', '==', id));
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        assignmentsSnapshot.forEach(assignmentDoc => {
            batch.delete(assignmentDoc.ref);
        });

        batch.delete(docRef);
        await batch.commit();

        revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to delete hostel.'}; }
}

// ========== ROOMS ==========
const RoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required.'),
  hostelId: z.string(),
  roomType: z.string().min(3, 'Room type is required (e.g., 2-Seater AC).'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  currentOccupancy: z.coerce.number().min(0).default(0),
  schoolId: z.string(),
});
const UpdateRoomSchema = RoomSchema.omit({ schoolId: true, hostelId: true });

export async function createRoom(prevState: any, formData: FormData) {
  const parsed = RoomSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
  try {
    const q = query(collection(db, 'hostelRooms'), where('schoolId', '==', parsed.data.schoolId), where('hostelId', '==', parsed.data.hostelId), where('roomNumber', '==', parsed.data.roomNumber));
    const existing = await getDocs(q);
    if (!existing.empty) return { success: false, error: `Room number ${parsed.data.roomNumber} already exists in this hostel.` };

    await addDoc(collection(db, 'hostelRooms'), parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/hostel`);
    return { success: true, message: 'Room added successfully.'};
  } catch (e) { return { success: false, error: 'Failed to create room.'}; }
}

export async function getRooms(schoolId: string, hostelId: string) {
    const q = query(collection(db, 'hostelRooms'), where('schoolId', '==', schoolId), where('hostelId', '==', hostelId));
    const snapshot = await getDocs(q);
    const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort manually by room number to avoid composite index
    rooms.sort((a, b) => (a.roomNumber as string).localeCompare(b.roomNumber as string, undefined, { numeric: true }));
    return rooms;
}

export async function updateRoom(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = UpdateRoomSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    try {
        const docRef = doc(db, 'hostelRooms', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
        return { success: true, message: 'Room updated successfully.' };
    } catch(e) { return { success: false, error: 'Failed to update room.'}; }
}

export async function deleteRoom(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'hostelRooms', id);
        const docSnap = await getDoc(docRef);
        if(!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.'};
        
        const batch = writeBatch(db);
        
        // Find and delete all student assignments for this room
        const assignmentsQuery = query(collection(db, 'hostelAssignments'), where('roomId', '==', id));
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        assignmentsSnapshot.forEach(assignmentDoc => {
            batch.delete(assignmentDoc.ref);
        });

        batch.delete(docRef);
        await batch.commit();

        revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to delete room.'}; }
}


// ========== STUDENT ALLOCATION ==========
const AssignStudentSchema = z.object({
  schoolId: z.string(),
  hostelId: z.string(),
  roomId: z.string(),
  studentId: z.string(),
});

export async function assignStudentToRoom(prevState: any, formData: FormData) {
  const parsed = AssignStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Invalid data provided." };

  const { schoolId, hostelId, roomId, studentId } = parsed.data;
  const roomRef = doc(db, 'hostelRooms', roomId);
  const assignmentRef = doc(collection(db, 'hostelAssignments'));

  try {
    // Check if student is already assigned somewhere else
    const existingAssignmentQuery = query(collection(db, 'hostelAssignments'), where('studentId', '==', studentId), where('schoolId', '==', schoolId));
    const existingAssignmentSnapshot = await getDocs(existingAssignmentQuery);
    if (!existingAssignmentSnapshot.empty) {
        return { success: false, error: "This student is already assigned to a hostel room." };
    }

    await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists() || roomDoc.data().schoolId !== schoolId) {
            throw new Error("Room not found or permission denied.");
        }
        
        const roomData = roomDoc.data();
        if (roomData.currentOccupancy >= roomData.capacity) {
            throw new Error("This room is already full.");
        }

        // Increment occupancy and create assignment
        transaction.update(roomRef, { currentOccupancy: increment(1) });
        transaction.set(assignmentRef, {
            ...parsed.data,
            assignedAt: serverTimestamp(),
        });
    });

    revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
    return { success: true, message: "Student assigned successfully." };

  } catch (e: any) {
    return { success: false, error: e.message || "Failed to assign student." };
  }
}

export async function getAssignedStudentsForRooms(schoolId: string, roomIds: string[]) {
    if (!schoolId || roomIds.length === 0) {
        return { success: true, data: {} };
    }

    try {
        const assignmentsRef = collection(db, 'hostelAssignments');
        const q = query(assignmentsRef, where('schoolId', '==', schoolId), where('roomId', 'in', roomIds));
        const assignmentsSnapshot = await getDocs(q);

        if (assignmentsSnapshot.empty) {
            return { success: true, data: {} };
        }

        const assignments = assignmentsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const studentIds = [...new Set(assignments.map(a => a.studentId))];

        if (studentIds.length === 0) {
            return { success: true, data: {} };
        }

        const studentDetails: Record<string, any> = {};
        
        // Firestore 'in' queries are limited to 30 items. Chunk the IDs.
        const studentIdChunks = [];
        for (let i = 0; i < studentIds.length; i += 30) {
            studentIdChunks.push(studentIds.slice(i, i + 30));
        }

        for (const chunk of studentIdChunks) {
             const studentsQuery = query(collection(db, 'students'), where(documentId(), 'in', chunk));
             const studentsSnapshot = await getDocs(studentsQuery);
             studentsSnapshot.forEach(doc => {
                if(doc.data().schoolId === schoolId) {
                    studentDetails[doc.id] = doc.data();
                }
             });
        }
       
        const assignmentsByRoom: Record<string, any[]> = {};
        assignments.forEach(assignment => {
            if (!assignmentsByRoom[assignment.roomId]) {
                assignmentsByRoom[assignment.roomId] = [];
            }
            if(studentDetails[assignment.studentId]) {
                 assignmentsByRoom[assignment.roomId].push({
                    assignmentId: assignment.id,
                    studentId: assignment.studentId,
                    studentName: studentDetails[assignment.studentId].studentName,
                });
            }
        });

        return { success: true, data: assignmentsByRoom };
    } catch (error) {
        console.error("Error fetching assigned students for rooms:", error);
        return { success: false, error: 'Failed to fetch assigned students.' };
    }
}

export async function unassignStudentFromRoom(schoolId: string, assignmentId: string) {
    if(!schoolId || !assignmentId) return { success: false, error: 'Missing required IDs.'};
    
    const assignmentRef = doc(db, 'hostelAssignments', assignmentId);

    try {
        await runTransaction(db, async (transaction) => {
            const assignmentDoc = await transaction.get(assignmentRef);
            if (!assignmentDoc.exists() || assignmentDoc.data().schoolId !== schoolId) {
                throw new Error("Assignment not found or permission denied.");
            }

            const { roomId } = assignmentDoc.data();
            const roomRef = doc(db, 'hostelRooms', roomId);
            const roomDoc = await transaction.get(roomRef);

            if(roomDoc.exists() && roomDoc.data().currentOccupancy > 0) {
                 // Decrement occupancy only if it's greater than 0
                transaction.update(roomRef, { currentOccupancy: increment(-1) });
            }
            
            // Delete the assignment record
            transaction.delete(assignmentRef);
        });

        revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
        return { success: true };
    } catch(e: any) {
        console.error("Failed to unassign student:", e);
        return { success: false, error: e.message || "An unexpected error occurred." };
    }
}
