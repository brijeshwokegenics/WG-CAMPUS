
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// ========== NOTICES ==========
const NoticeSchema = z.object({
  schoolId: z.string(),
  title: z.string().min(3, "Title is required."),
  content: z.string().min(10, "Content is required."),
  audience: z.array(z.string()).min(1, "At least one audience must be selected."),
  postedAt: z.date().default(() => new Date()),
});

const UpdateNoticeSchema = NoticeSchema.omit({ schoolId: true, postedAt: true });

export async function createNotice(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        title: formData.get('title'),
        content: formData.get('content'),
        audience: formData.getAll('audience'),
        postedAt: new Date(),
    };
    const parsed = NoticeSchema.safeParse(rawData);
    if (!parsed.success) return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    try {
        await addDoc(collection(db, 'notices'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/communication/notices`);
        return { success: true, message: 'Notice posted successfully.' };
    } catch (e) {
        return { success: false, error: 'Failed to post notice.' };
    }
}

export async function getNotices(schoolId: string) {
    const q = query(collection(db, 'notices'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const notices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        postedAt: doc.data().postedAt.toDate(),
    }));

    // Sort in code to avoid needing a composite index
    notices.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());

    return notices;
}

export async function updateNotice(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const parsed = UpdateNoticeSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
        audience: formData.getAll('audience'),
    });
    if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };
    try {
        const docRef = doc(db, 'notices', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.' };
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/communication/notices`);
        return { success: true, message: 'Notice updated successfully.' };
    } catch (e) {
        return { success: false, error: 'Failed to update notice.' };
    }
}

export async function deleteNotice(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'notices', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.' };
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/communication/notices`);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete notice.' };
    }
}


// ========== CALENDAR EVENTS ==========
const EventSchema = z.object({
  schoolId: z.string(),
  title: z.string().min(3, "Event title is required."),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean().default(true),
  type: z.enum(['Holiday', 'Event', 'Exam', 'Other']).default('Event'),
  description: z.string().optional(),
}).refine(data => data.end >= data.start, {
    message: "End date must be on or after the start date.",
    path: ["end"],
});

export async function createEvent(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        title: formData.get('title'),
        start: new Date(formData.get('start') as string),
        end: new Date(formData.get('end') as string),
        allDay: formData.get('allDay') === 'true',
        type: formData.get('type'),
        description: formData.get('description'),
    };

    const parsed = EventSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    }
    
    try {
        await addDoc(collection(db, 'calendarEvents'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/communication/calendar`);
        return { success: true, message: 'Event created successfully.' };
    } catch (e) {
        return { success: false, error: 'Failed to create event.' };
    }
}

export async function getEvents(schoolId: string) {
    const q = query(collection(db, 'calendarEvents'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start.toDate(),
        end: doc.data().end.toDate(),
        allDay: doc.data().allDay,
        type: doc.data().type,
        description: doc.data().description,
    }));
}

export async function updateEvent(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;
    const rawData = {
        title: formData.get('title'),
        start: new Date(formData.get('start') as string),
        end: new Date(formData.get('end') as string),
        allDay: formData.get('allDay') === 'true',
        type: formData.get('type'),
        description: formData.get('description'),
    };
    
    const parsed = EventSchema.omit({schoolId: true}).safeParse(rawData);
    if (!parsed.success) return { success: false, error: 'Invalid data.', details: parsed.error.flatten() };

    try {
        const docRef = doc(db, 'calendarEvents', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.' };
        
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/communication/calendar`);
        return { success: true, message: 'Event updated successfully.' };
    } catch (e) {
        return { success: false, error: 'Failed to update event.' };
    }
}

export async function deleteEvent(id: string, schoolId: string) {
    try {
        const docRef = doc(db, 'calendarEvents', id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) return { success: false, error: 'Permission denied.' };
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/communication/calendar`);
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Failed to delete event.' };
    }
}

// ========== MESSAGING ==========
const MessageSchema = z.object({
  schoolId: z.string(),
  senderId: z.string(), // e.g., director's ID
  senderName: z.string(),
  recipients: z.array(z.string()).min(1, "At least one recipient is required."),
  recipientDescription: z.string(), // A string describing the audience, e.g., "Class 5A", "All Teachers"
  content: z.string().min(1, "Message content cannot be empty."),
  sentAt: z.date(),
});

export async function sendMessage(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        senderId: 'director', // Hardcoded for now
        senderName: 'Director',
        recipients: formData.getAll('recipients'),
        recipientDescription: formData.get('recipientDescription'),
        content: formData.get('content'),
        sentAt: new Date(),
    };

    const parsed = MessageSchema.safeParse(rawData);
    if (!parsed.success) {
        return { success: false, error: "Invalid data.", details: parsed.error.flatten() };
    }

    try {
        await addDoc(collection(db, 'messages'), parsed.data);
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/communication/messaging`);
        return { success: true, message: "Message sent successfully." };
    } catch (e) {
        console.error('Error sending message:', e);
        return { success: false, error: "Failed to send message." };
    }
}

export async function getSentMessages(schoolId: string) {
    try {
        const q = query(
            collection(db, 'messages'),
            where('schoolId', '==', schoolId),
            orderBy('sentAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sentAt: doc.data().sentAt.toDate(),
        }));
        return { success: true, data: messages };
    } catch (e) {
        console.error('Error fetching messages:', e);
        return { success: false, error: "Failed to fetch messages." };
    }
}
