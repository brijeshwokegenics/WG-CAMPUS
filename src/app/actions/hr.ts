'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns';

// ========== SALARY ==========
const AllowanceSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().min(0),
});

const DeductionSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().min(0),
});

const SalarySchema = z.object({
  schoolId: z.string().min(1),
  userId: z.string().min(1),
  basicSalary: z.coerce.number().min(0, "Basic salary must be a positive number."),
  allowances: z.array(AllowanceSchema).optional(),
  deductions: z.array(DeductionSchema).optional(),
});

export async function setStaffSalary(prevState: any, formData: FormData) {
  const rawData = {
    schoolId: formData.get('schoolId'),
    userId: formData.get('userId'),
    basicSalary: formData.get('basicSalary'),
    allowances: JSON.parse(formData.get('allowances') as string),
    deductions: JSON.parse(formData.get('deductions') as string),
  };

  const parsed = SalarySchema.safeParse(rawData);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { success: false, error: "Invalid data provided." };
  }

  const { schoolId, userId } = parsed.data;

  try {
    const salaryDocRef = doc(db, 'staffSalaries', `${schoolId}_${userId}`);
    await setDoc(salaryDocRef, parsed.data);
    revalidatePath(`/director/dashboard/${schoolId}/hr/salary`);
    return { success: true, message: "Salary updated successfully." };
  } catch (error) {
    console.error("Error setting staff salary:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function getStaffSalaries(schoolId: string) {
  try {
    const salariesRef = collection(db, 'staffSalaries');
    const q = query(salariesRef, where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    const salaries = snapshot.docs.map(doc => doc.data());
    return { success: true, data: salaries };
  } catch (error) {
    console.error("Error fetching staff salaries:", error);
    return { success: false, error: "Failed to fetch salaries." };
  }
}

export async function getStaffSalaryByUserId(schoolId: string, userId: string) {
    try {
        const salaryDocRef = doc(db, 'staffSalaries', `${schoolId}_${userId}`);
        const docSnap = await getDoc(salaryDocRef);
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        return { success: false, error: 'Salary not found' };
    } catch(e) {
        console.error("Error fetching staff salary:", e);
        return { success: false, error: "Failed to fetch salary." };
    }
}


// ========== ATTENDANCE ==========
const StaffAttendanceStatusSchema = z.enum(["Present", "Absent", "Leave"]);
const StaffAttendanceRecordSchema = z.record(z.string(), StaffAttendanceStatusSchema);

const StaffAttendanceSchema = z.object({
    schoolId: z.string(),
    date: z.string(), // YYYY-MM-DD
    attendance: StaffAttendanceRecordSchema,
});

export async function saveStaffAttendance(prevState: any, formData: FormData) {
    const rawData = {
        schoolId: formData.get('schoolId'),
        date: formData.get('date'),
        attendance: JSON.parse(formData.get('attendance') as string),
    };

    const parsed = StaffAttendanceSchema.safeParse(rawData);
    
    if (!parsed.success) {
        return { success: false, error: 'Invalid data for attendance.', details: parsed.error.flatten() };
    }

    const { schoolId, date, attendance } = parsed.data;
    const docId = `${schoolId}_${date}`;

    try {
        const attendanceRef = doc(db, 'staffAttendance', docId);
        await setDoc(attendanceRef, { schoolId, date, attendance }, { merge: true });
        
        revalidatePath(`/director/dashboard/${schoolId}/hr/attendance`);
        return { success: true, message: 'Attendance saved successfully!' };

    } catch (error) {
        console.error('Error saving staff attendance:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function getStaffAttendanceForDate({ schoolId, date }: { schoolId: string, date: string }) {
    const docId = `${schoolId}_${date}`;
    try {
        const attendanceRef = doc(db, 'staffAttendance', docId);
        const docSnap = await getDoc(attendanceRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data().attendance };
        } else {
            return { success: true, data: null }; // No record found for this date is not an error
        }
    } catch (error) {
        console.error('Error fetching staff attendance:', error);
        return { success: false, error: 'Failed to fetch attendance data.' };
    }
}


export async function getMonthlyStaffAttendance({ schoolId, month }: { schoolId: string, month: string }) {
    if (!schoolId || !month) {
        return { success: false, error: 'Missing required fields to fetch attendance report.' };
    }

    try {
        const [year, monthIndex] = month.split('-').map(Number);
        const startDate = startOfMonth(new Date(year, monthIndex - 1));
        const endDate = endOfMonth(new Date(year, monthIndex - 1));

        // Get all staff for the school first
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('schoolId', '==', schoolId));
        const usersSnapshot = await getDocs(usersQuery);
        const staff = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (staff.length === 0) {
            return { success: true, data: { staff: [], attendance: [] } };
        }

        const attendanceRef = collection(db, 'staffAttendance');
        const q = query(attendanceRef,
            where('schoolId', '==', schoolId),
            where('date', '>=', format(startDate, 'yyyy-MM-dd')),
            where('date', '<=', format(endDate, 'yyyy-MM-dd'))
        );

        const querySnapshot = await getDocs(q);
        const attendanceRecords = querySnapshot.docs.map(doc => doc.data());
        
        return { success: true, data: { staff, attendance: attendanceRecords } };

    } catch (error) {
        console.error('Error fetching monthly staff attendance:', error);
        return { success: false, error: 'Failed to fetch monthly staff attendance data.' };
    }
}


// ========== PAYROLL ==========
const PayrollGenerationSchema = z.object({
    schoolId: z.string(),
    month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
});

export async function generatePayrollForMonth(prevState: any, formData: FormData) {
    const parsed = PayrollGenerationSchema.safeParse({
        schoolId: formData.get('schoolId'),
        month: formData.get('month'),
    });

    if (!parsed.success) {
        return { success: false, error: "Invalid data provided." };
    }

    const { schoolId, month } = parsed.data;
    const [year, monthIndex] = month.split('-').map(Number);
    
    try {
        // 1. Get all users for the school
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('schoolId', '==', schoolId), where('enabled', '==', true));
        const usersSnapshot = await getDocs(usersQuery);
        const users = usersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // 2. Get all salary structures
        const salariesRes = await getStaffSalaries(schoolId);
        if (!salariesRes.success) throw new Error("Could not fetch salaries.");
        const salaries = salariesRes.data;

        // 3. Get all attendance records for the month
        const startDate = startOfMonth(new Date(year, monthIndex - 1));
        const endDate = endOfMonth(new Date(year, monthIndex - 1));
        const monthDates = eachDayOfInterval({ start: startDate, end: endDate });
        
        const attendancePromises = monthDates.map(date => 
            getStaffAttendanceForDate({ schoolId, date: format(date, 'yyyy-MM-dd') })
        );
        const attendanceResults = await Promise.all(attendancePromises);
        const monthlyAttendance = attendanceResults.map(res => res.data).filter(Boolean);

        // 4. Process payroll for each user
        const payrollData = users.map(user => {
            const salaryInfo = salaries.find((s: any) => s.userId === user.id);
            if (!salaryInfo) {
                return {
                    userId: user.id,
                    name: user.name,
                    error: "Salary not set.",
                };
            }

            const totalDays = monthDates.length;
            const presentDays = monthlyAttendance.filter(att => att && att[user.id] === 'Present').length;
            const leaveDays = monthlyAttendance.filter(att => att && att[user.id] === 'Leave').length;
            const absentDays = totalDays - presentDays - leaveDays;
            
            // Pro-rata salary calculation
            const payableDays = presentDays + leaveDays; // Or however leaves are handled
            const perDaySalary = salaryInfo.basicSalary / totalDays;
            const earnedBasic = perDaySalary * payableDays;

            const totalAllowances = salaryInfo.allowances?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
            const totalDeductions = salaryInfo.deductions?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
            
            // Pro-rata allowances if needed, for now using full amount
            const earnedAllowances = (totalAllowances / totalDays) * payableDays;

            const grossSalary = earnedBasic + earnedAllowances;
            const netSalary = grossSalary - totalDeductions;

            return {
                userId: user.id,
                name: user.name,
                status: 'Processed',
                salaryDetails: {
                    basic: salaryInfo.basicSalary,
                    allowances: salaryInfo.allowances || [],
                    totalAllowances,
                    deductions: salaryInfo.deductions || [],
                    totalDeductions,
                },
                attendanceDetails: {
                    totalDays,
                    presentDays,
                    absentDays,
                    leaveDays,
                },
                payout: {
                    earnedBasic: Math.round(earnedBasic),
                    earnedAllowances: Math.round(earnedAllowances),
                    grossSalary: Math.round(grossSalary),
                    netPayable: Math.round(netSalary),
                },
            };
        });

        // 5. Save the generated payroll record
        const payrollDocRef = doc(db, 'payrolls', `${schoolId}_${month}`);
        await setDoc(payrollDocRef, {
            schoolId,
            month,
            generatedOn: new Date().toISOString(),
            payrollData,
        });

        revalidatePath(`/director/dashboard/${schoolId}/hr/payroll`);
        return { success: true, message: `Payroll for ${format(startDate, 'MMMM yyyy')} generated successfully.` };

    } catch (error) {
        console.error("Error generating payroll:", error);
        const e = error as Error;
        return { success: false, error: `An unexpected error occurred: ${e.message}` };
    }
}

export async function getPayrollForMonth(schoolId: string, month: string) {
    try {
        const payrollDocRef = doc(db, 'payrolls', `${schoolId}_${month}`);
        const docSnap = await getDoc(payrollDocRef);
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        return { success: false, error: "Payroll record not found for this month." };
    } catch (error) {
        console.error("Error fetching payroll:", error);
        return { success: false, error: "Failed to fetch payroll." };
    }
}


export async function getPayrollHistory(schoolId: string) {
     try {
        const payrollsRef = collection(db, 'payrolls');
        const q = query(payrollsRef, where('schoolId', '==', schoolId));
        const snapshot = await getDocs(q);
        const payrolls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { success: true, data: payrolls };
      } catch (error) {
        console.error("Error fetching payroll history:", error);
        return { success: false, error: "Failed to fetch payrolls." };
      }
}
