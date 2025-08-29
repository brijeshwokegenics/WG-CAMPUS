
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// ========== SCHEMAS ==========

const SmsConfigSchema = z.object({
    schoolId: z.string(),
    smsProvider: z.string().optional(),
    smsSid: z.string().optional(),
    smsToken: z.string().optional(),
    smsNumber: z.string().optional(),
});

const WhatsappConfigSchema = z.object({
    schoolId: z.string(),
    whatsappProvider: z.string().optional(),
    whatsappApiKey: z.string().optional(),
    whatsappAuthToken: z.string().optional(),
    whatsappNumber: z.string().optional(),
});

const EmailConfigSchema = z.object({
    schoolId: z.string(),
    smtpHost: z.string().optional(),
    smtpPort: z.string().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
    fromEmail: z.string().optional(),
});


// ========== ACTIONS ==========

export async function saveSmsConfiguration(prevState: any, formData: FormData) {
    const parsed = SmsConfigSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { success: false, error: "Invalid data provided for SMS config." };
    
    try {
        const docRef = doc(db, 'integrationSettings', parsed.data.schoolId);
        await setDoc(docRef, { sms: parsed.data }, { merge: true });
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/integrations`);
        return { success: true, message: 'SMS configuration saved successfully.' };
    } catch(e) {
        return { success: false, error: 'Failed to save SMS configuration.' };
    }
}

export async function saveWhatsappConfiguration(prevState: any, formData: FormData) {
    const parsed = WhatsappConfigSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { success: false, error: "Invalid data provided for WhatsApp config." };
    
    try {
        const docRef = doc(db, 'integrationSettings', parsed.data.schoolId);
        await setDoc(docRef, { whatsapp: parsed.data }, { merge: true });
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/integrations`);
        return { success: true, message: 'WhatsApp configuration saved successfully.' };
    } catch(e) {
        return { success: false, error: 'Failed to save WhatsApp configuration.' };
    }
}

export async function saveEmailConfiguration(prevState: any, formData: FormData) {
    const parsed = EmailConfigSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return { success: false, error: "Invalid data provided for Email config." };
    
    try {
        const docRef = doc(db, 'integrationSettings', parsed.data.schoolId);
        await setDoc(docRef, { email: parsed.data }, { merge: true });
        revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/integrations`);
        return { success: true, message: 'Email configuration saved successfully.' };
    } catch(e) {
        return { success: false, error: 'Failed to save Email configuration.' };
    }
}


// ========== GETTERS ==========

export async function getIntegrationSettings(schoolId: string) {
    if (!schoolId) {
        return { success: false, error: 'School ID is required.', data: null };
    }
    try {
        const docRef = doc(db, 'integrationSettings', schoolId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        return { success: true, data: null };
    } catch (e) {
        return { success: false, error: 'Failed to fetch integration settings.', data: null };
    }
}
