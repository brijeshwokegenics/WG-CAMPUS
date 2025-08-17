
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc, serverTimestamp, orderBy } from 'firebase/firestore';
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
        
        // Also delete all rooms in this hostel
        const roomsQuery = query(collection(db, 'hostelRooms'), where('hostelId', '==', id));
        const roomsSnapshot = await getDocs(roomsQuery);
        const batch = writeBatch(db);
        roomsSnapshot.forEach(roomDoc => {
            batch.delete(roomDoc.ref);
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
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/hostel`);
        return { success: true };
    } catch(e) { return { success: false, error: 'Failed to delete room.'}; }
}
