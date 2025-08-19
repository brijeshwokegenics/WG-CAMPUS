
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getStudentById } from './academics';
import { startOfToday, endOfToday, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { getStudentTransportAssignment } from './transport';

// ========== FEE HEADS ==========

const FeeHeadSchema = z.object({
  name: z.string().min(3, "Fee head name must be at least 3 characters."),
  description: z.string().optional(),
  type: z.enum(["One-time", "Annual", "Monthly", "Quarterly"]),
  schoolId: z.string().min(1),
});

const UpdateFeeHeadSchema = FeeHeadSchema.omit({ schoolId: true });

export async function createFeeHead(prevState: any, formData: FormData) {
  const parsed = FeeHeadSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { success: false, error: "Invalid data provided.", details: parsed.error.flatten() };
  }

  try {
    const feeHeadsRef = collection(db, 'feeHeads');
    const q = query(feeHeadsRef, where('schoolId', '==', parsed.data.schoolId), where('name', '==', parsed.data.name));
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: `A fee head named "${parsed.data.name}" already exists.` };
    }

    await addDoc(feeHeadsRef, parsed.data);
    revalidatePath(`/director/dashboard/${parsed.data.schoolId}/admin/fee-structure`);
    return { success: true, message: 'Fee head created successfully.' };
  } catch (error) {
    console.error("Error creating fee head:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function getFeeHeads(schoolId: string) {
  try {
    const feeHeadsRef = collection(db, 'feeHeads');
    const q = query(feeHeadsRef, where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const feeHeads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: feeHeads };
  } catch (error) {
    console.error("Error fetching fee heads:", error);
    return { success: false, error: "Failed to fetch fee heads." };
  }
}

export async function updateFeeHead(prevState: any, formData: FormData) {
    const feeHeadId = formData.get('id') as string;
    const schoolId = formData.get('schoolId') as string;

    const parsed = UpdateFeeHeadSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        type: formData.get('type'),
    });

    if (!parsed.success) {
        return { success: false, error: "Invalid data provided.", details: parsed.error.flatten() };
    }

    try {
        const docRef = doc(db, 'feeHeads', feeHeadId);
        // Security check
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Fee head not found or permission denied." };
        }
        
        await updateDoc(docRef, parsed.data);
        revalidatePath(`/director/dashboard/${schoolId}/admin/fee-structure`);
        return { success: true, message: 'Fee head updated successfully.' };

    } catch (error) {
        console.error("Error updating fee head:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function deleteFeeHead({ id, schoolId }: { id: string; schoolId: string }) {
    try {
        const docRef = doc(db, 'feeHeads', id);
        // Security check
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Fee head not found or permission denied." };
        }
        await deleteDoc(docRef);
        revalidatePath(`/director/dashboard/${schoolId}/admin/fee-structure`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting fee head:", error);
        return { success: false, error: "Failed to delete fee head." };
    }
}


// ========== FEE STRUCTURE ==========

const FeeStructureEntrySchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0, "Amount must be 0 or more."),
});

const FeeStructureSchema = z.object({
  schoolId: z.string(),
  classId: z.string(),
  structure: z.array(FeeStructureEntrySchema),
});


export async function saveFeeStructure(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        classId: formData.get('classId'),
        structure: JSON.parse(formData.get('structure') as string),
    };

    const parsed = FeeStructureSchema.safeParse(rawData);

    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: "Invalid data provided for fee structure." };
    }
    
    const { schoolId, classId, structure } = parsed.data;
    const docId = `${schoolId}_${classId}`;

    try {
        const docRef = doc(db, 'feeStructures', docId);
        await setDoc(docRef, { schoolId, classId, structure });
        
        revalidatePath(`/director/dashboard/${schoolId}/admin/fee-structure`);
        return { success: true, message: "Fee structure saved successfully." };
    } catch (error) {
        console.error("Error saving fee structure:", error);
        return { success: false, error: "Failed to save fee structure." };
    }
}

export async function getFeeStructure(schoolId: string, classId: string) {
    const docId = `${schoolId}_${classId}`;
    try {
        const docRef = doc(db, 'feeStructures', docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().schoolId === schoolId) {
            return { success: true, data: docSnap.data() };
        }
        return { success: true, data: null }; // Not found is not an error
    } catch (error) {
        console.error("Error fetching fee structure:", error);
        return { success: false, error: "Failed to fetch fee structure." };
    }
}


// ========== FEE COLLECTION ==========
const FeePaymentItemSchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0),
  installmentName: z.string().optional(), // e.g., "April" or "Quarter 1"
});

const FeeCollectionSchema = z.object({
    schoolId: z.string(),
    studentId: z.string(),
    classId: z.string(),
    paymentDate: z.date(),
    paymentMode: z.enum(['Cash', 'Cheque', 'UPI', 'Card', 'Bank Transfer']),
    transactionId: z.string().optional(),
    totalAmount: z.coerce.number().min(1, "Total amount must be greater than 0."),
    paidFor: z.array(FeePaymentItemSchema),
    discount: z.coerce.number().min(0).optional(),
    fine: z.coerce.number().min(0).optional(),
    receiptNumber: z.string().optional(), // Will be generated on server
});

export async function collectFee(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        studentId: formData.get('studentId'),
        classId: formData.get('classId'),
        paymentDate: new Date(formData.get('paymentDate') as string),
        paymentMode: formData.get('paymentMode'),
        transactionId: formData.get('transactionId'),
        totalAmount: formData.get('totalAmount'),
        paidFor: JSON.parse(formData.get('paidFor') as string),
        discount: formData.get('discount'),
        fine: formData.get('fine'),
    };

    const parsed = FeeCollectionSchema.safeParse(rawData);

    if (!parsed.success) {
        console.log(parsed.error.flatten());
        return { success: false, error: 'Invalid data provided.', details: parsed.error.flatten() };
    }

    const { schoolId, studentId } = parsed.data;

    try {
        const counterRef = doc(db, 'counters', `${schoolId}_feeReceipt`);
        
        const newReceiptNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            const currentNumber = counterDoc.exists() ? counterDoc.data().currentNumber : 0;
            const newNumber = currentNumber + 1;
            transaction.set(counterRef, { currentNumber: newNumber }, { merge: true });
            return newNumber.toString().padStart(6, '0');
        });
        
        const dataToSave = {
            ...parsed.data,
            receiptNumber: `RCPT-${newReceiptNumber}`,
            createdAt: serverTimestamp(),
        };

        const newDocRef = await addDoc(collection(db, 'feeCollections'), dataToSave);
        
        revalidatePath(`/director/dashboard/${schoolId}/admin/fees`);
        revalidatePath(`/accountant/${schoolId}/fees`);
        revalidatePath(`/director/dashboard/${schoolId}`);
        
        return { success: true, message: `Fee collected successfully. Receipt No: ${dataToSave.receiptNumber}`, receiptId: newDocRef.id };

    } catch (error) {
        console.error("Error collecting fee:", error);
        return { success: false, error: 'An unexpected error occurred while collecting the fee.' };
    }
}

export async function getStudentFeeDetails(schoolId: string, studentId: string) {
    try {
        // --- 1. Fetch all necessary base data in parallel ---
        const studentRes = await getStudentById(studentId, schoolId);
        if (!studentRes.success || !studentRes.data) {
            return { success: false, error: "Student not found." };
        }
        const student = studentRes.data;

        const structureRes = await getFeeStructure(schoolId, student.classId);
        const feeHeadsRes = await getFeeHeads(schoolId);
        const transportRes = await getStudentTransportAssignment(schoolId, studentId);

        const paymentsRef = collection(db, 'feeCollections');
        const q = query(paymentsRef, where('schoolId', '==', schoolId), where('studentId', '==', studentId));
        const paymentSnapshot = await getDocs(q);

        // --- 2. Process the fetched data ---
        let feeStructure = structureRes.success ? structureRes.data : null;
        const allFeeHeads = feeHeadsRes.success ? feeHeadsRes.data : [];
        const paymentHistory = paymentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            paymentDate: doc.data().paymentDate.toDate(),
        })).sort((a,b) => a.paymentDate.getTime() - b.paymentDate.getTime()); // Sort oldest first for allocation

        // --- 2.5. Inject transport fee if applicable ---
        if (transportRes.success && transportRes.data) {
            const transportFeeData = transportRes.data;
            if (feeStructure) {
                // Add transport fee to the existing structure
                 feeStructure.structure.push({
                    feeHeadId: 'transport_fee',
                    feeHeadName: 'Transport Fee',
                    amount: transportFeeData.fee,
                });
            } else {
                 // Create a structure if none exists, just for the transport fee
                feeStructure = {
                    schoolId,
                    classId: student.classId,
                    structure: [{
                        feeHeadId: 'transport_fee',
                        feeHeadName: 'Transport Fee',
                        amount: transportFeeData.fee,
                    }]
                }
            }
             // Add a virtual fee head for transport
            allFeeHeads.push({
                id: 'transport_fee',
                name: 'Transport Fee',
                type: 'Annual',
                schoolId: schoolId,
            });
        }

        // --- 3. Calculate Fee Status with Installment Logic ---
        const feeStatus: any[] = [];
        if (feeStructure && allFeeHeads) {
            for (const structureItem of feeStructure.structure) {
                const feeHead = allFeeHeads.find((h: any) => h.id === structureItem.feeHeadId);
                if (!feeHead) continue;

                let installments: { name: string; amount: number }[] = [];
                const amountPerInstallment = structureItem.amount || 0;

                if (feeHead.type === 'Monthly') {
                    const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
                    installments = months.map(m => ({ name: m, amount: amountPerInstallment }));
                } else if (feeHead.type === 'Quarterly') {
                    const quarters = ["Quarter 1 (Apr-Jun)", "Quarter 2 (Jul-Sep)", "Quarter 3 (Oct-Dec)", "Quarter 4 (Jan-Mar)"];
                    installments = quarters.map(q => ({ name: q, amount: amountPerInstallment }));
                } else { // One-time or Annual
                    installments = [{ name: feeHead.name, amount: amountPerInstallment }];
                }
                
                // Get all payments and discounts specifically for this fee head
                const paymentsForThisHead = paymentHistory.flatMap(p => 
                    p.paidFor.filter((item: any) => item.feeHeadId === structureItem.feeHeadId)
                );
                let totalPaidForThisHead = paymentsForThisHead.reduce((sum, item) => sum + (item.amount || 0), 0);
                
                let totalDiscountForThisHead = 0;
                paymentHistory.forEach(p => {
                    const paidItemInTransaction = p.paidFor.find((item: any) => item.feeHeadId === structureItem.feeHeadId);
                    if (paidItemInTransaction && p.totalAmount > 0 && p.discount > 0) {
                        const proportion = (paidItemInTransaction.amount || 0) / p.totalAmount;
                        totalDiscountForThisHead += proportion * p.discount;
                    }
                });
                
                let remainingPaid = totalPaidForThisHead + totalDiscountForThisHead;

                const detailedInstallments = installments.map(inst => {
                    const paidForThisInstallment = Math.min(remainingPaid, inst.amount);
                    remainingPaid -= paidForThisInstallment;
                    const due = inst.amount - paidForThisInstallment;
                    
                    return {
                        name: inst.name,
                        payable: inst.amount,
                        paid: paidForThisInstallment,
                        due: Math.round(due > 0 ? due : 0),
                        status: due <= 0 ? 'Paid' : (paidForThisInstallment > 0 ? 'Partial' : 'Unpaid'),
                    };
                });
                
                feeStatus.push({
                    feeHeadId: structureItem.feeHeadId,
                    feeHeadName: structureItem.feeHeadName,
                    type: feeHead.type,
                    installments: detailedInstallments,
                    totalPayable: detailedInstallments.reduce((acc, i) => acc + i.payable, 0),
                    totalPaid: totalPaidForThisHead,
                    totalDiscount: Math.round(totalDiscountForThisHead),
                    totalDue: detailedInstallments.reduce((acc, i) => acc + i.due, 0),
                });
            }
        }
        
        // Sort payment history for display (newest first)
        paymentHistory.sort((a,b) => b.paymentDate.getTime() - a.paymentDate.getTime());

        return { success: true, data: { student, feeStructure, paymentHistory, feeStatus } };

    } catch (error) {
        console.error("Error fetching student fee details:", error);
        return { success: false, error: "Failed to fetch fee details." };
    }
}


export async function getFeeReceipt(receiptId: string, schoolId: string) {
    try {
        const docRef = doc(db, 'feeCollections', receiptId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || docSnap.data().schoolId !== schoolId) {
            return { success: false, error: "Receipt not found or permission denied." };
        }
        
        const receiptData = docSnap.data();
        
        const dataWithDate = {
            ...receiptData,
            paymentDate: receiptData.paymentDate.toDate(),
        };

        const studentRes = await getStudentById(receiptData.studentId, receiptData.schoolId);
        
        const studentInfo = studentRes.success ? studentRes.data : {
            studentName: 'Student Not Found',
            className: 'N/A',
            section: 'N/A',
            fatherName: 'N/A',
            motherName: 'N/A'
        };


        return { success: true, data: { ...dataWithDate, student: studentInfo } };

    } catch (error) {
        console.error("Error fetching fee receipt:", error);
        return { success: false, error: "Failed to fetch receipt." };
    }
}


export async function getFeeCollectionsSummary(schoolId: string) {
    if (!schoolId) {
        return { success: false, error: "School ID is required." };
    }

    try {
        const todayStart = startOfToday();
        const todayEnd = endOfToday();
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        const yearStart = startOfYear(new Date());
        const yearEnd = endOfYear(new Date());

        const collectionsRef = collection(db, 'feeCollections');
        
        const dailyQuery = query(collectionsRef, where('schoolId', '==', schoolId), where('paymentDate', '>=', todayStart), where('paymentDate', '<=', todayEnd));
        const monthlyQuery = query(collectionsRef, where('schoolId', '==', schoolId), where('paymentDate', '>=', monthStart), where('paymentDate', '<=', monthEnd));
        const yearlyQuery = query(collectionsRef, where('schoolId', '==', schoolId), where('paymentDate', '>=', yearStart), where('paymentDate', '<=', yearEnd));

        const [dailySnapshot, monthlySnapshot, yearlySnapshot] = await Promise.all([
            getDocs(dailyQuery),
            getDocs(monthlyQuery),
            getDocs(yearlyQuery),
        ]);

        const dailyTotal = dailySnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);
        const monthlyTotal = monthlySnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);
        const yearlyTotal = yearlySnapshot.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);

        return {
            success: true,
            data: {
                daily: dailyTotal,
                monthly: monthlyTotal,
                yearly: yearlyTotal,
            }
        };

    } catch (error) {
        console.error("Error fetching fee collections summary:", error);
        return { success: false, error: "Failed to fetch fee collections summary." };
    }
}
    
