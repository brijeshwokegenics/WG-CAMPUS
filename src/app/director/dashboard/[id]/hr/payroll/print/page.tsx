
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPayrollForMonth } from '@/app/actions/hr';
import { getSchool } from '@/app/actions/school';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

type School = any;
type PayrollData = any;

function PayslipView({ schoolId, month, userId }: { schoolId: string, month: string, userId: string }) {
    const [school, setSchool] = useState<School>(null);
    const [payroll, setPayroll] = useState<PayrollData>(null);
    const [staffData, setStaffData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [schoolRes, payrollRes] = await Promise.all([
                getSchool(schoolId),
                getPayrollForMonth(schoolId, month)
            ]);

            if (schoolRes.school) setSchool(schoolRes.school);
            if (payrollRes.success && payrollRes.data) {
                setPayroll(payrollRes.data);
                const employeeData = payrollRes.data.payrollData.find((d: any) => d.userId === userId);
                setStaffData(employeeData);
            }
            setLoading(false);
        }

        if (schoolId && month && userId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [schoolId, month, userId]);
    
    useEffect(() => {
        if (!loading && staffData && school) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading, staffData, school]);


    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Payslip...</div>;
    }

    if (!staffData || !school) {
        return <div className="p-8 text-center">Could not load payslip data. Please check the details.</div>;
    }

    const { name, salaryDetails, attendanceDetails, payout } = staffData;
    const numberToWords = require('number-to-words');

    return (
         <div className="bg-white min-h-screen p-4 sm:p-8 flex items-center justify-center font-sans">
            <style type="text/css" media="print">
              {`
                @page { size: A4; margin: 0; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
                .payslip-container {
                    margin: 0;
                    box-shadow: none;
                    border-radius: 0;
                 }
              `}
            </style>
            
            <div className="payslip-container w-full max-w-4xl bg-white shadow-lg border">
                <div className="p-8">
                    <div className="text-center mb-8 border-b-2 pb-4">
                        <h1 className="text-3xl font-bold uppercase">{school.schoolName}</h1>
                        <p className="text-sm text-gray-600 mt-1">{school.address}, {school.city}, {school.state} - {school.zipcode}</p>
                        <h2 className="text-xl font-semibold mt-4">Payslip for the month of {format(new Date(`${month}-02`), 'MMMM yyyy')}</h2>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <p><strong>Employee Name:</strong> <span className='font-semibold text-base'>{name}</span></p>
                        <p><strong>Employee ID:</strong> {userId}</p>
                         <p><strong>Pay Period:</strong> {format(new Date(`${month}-02`), 'MMMM yyyy')}</p>
                        <p><strong>Pay Date:</strong> {format(new Date(), 'dd MMMM, yyyy')}</p>
                        <p><strong>Total Days:</strong> {attendanceDetails.totalDays}</p>
                        <p><strong>Present Days:</strong> {attendanceDetails.presentDays + attendanceDetails.leaveDays}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Earnings */}
                        <div>
                            <h3 className="text-lg font-semibold border-b mb-2 pb-1">Earnings</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr>
                                        <td className="py-1">Basic Salary</td>
                                        <td className="py-1 text-right">{payout.earnedBasic.toLocaleString('en-IN')}</td>
                                    </tr>
                                    {salaryDetails.allowances.map((item: any, index: number) => (
                                        <tr key={`allowance-${index}`}>
                                            <td className="py-1">{item.name}</td>
                                            <td className="py-1 text-right">{item.amount.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="font-bold border-t-2">
                                     <tr>
                                        <td className="py-2">Gross Earnings</td>
                                        <td className="py-2 text-right">{payout.grossSalary.toLocaleString('en-IN')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {/* Deductions */}
                         <div>
                            <h3 className="text-lg font-semibold border-b mb-2 pb-1">Deductions</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                     {salaryDetails.deductions.map((item: any, index: number) => (
                                        <tr key={`deduction-${index}`}>
                                            <td className="py-1">{item.name}</td>
                                            <td className="py-1 text-right">{item.amount.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="font-bold border-t-2">
                                     <tr>
                                        <td className="py-2">Total Deductions</td>
                                        <td className="py-2 text-right">{payout.applicableDeductions.toLocaleString('en-IN')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t-2">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Net Salary Payable</span>
                             <span>{payout.netPayable.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        </div>
                         <p className="text-right text-sm capitalize">
                            (Rupees {numberToWords.toWords(payout.netPayable)} Only)
                        </p>
                    </div>

                    <div className="mt-20 pt-8 flex justify-between items-end text-sm">
                        <div>
                            <p className="border-t-2 border-gray-400 pt-1 px-8">Employee's Signature</p>
                        </div>
                        <div>
                            <p className="border-t-2 border-gray-400 pt-1 px-8">Director's Signature</p>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-8">
                        This is a computer-generated payslip and does not require a physical signature.
                    </div>
                </div>
            </div>

             <div className="fixed bottom-4 right-4 no-print space-x-2">
                 <Button onClick={() => window.print()}>Print Payslip</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </div>
    );
}

export default function PayslipPrintPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const month = searchParams.get('month');
    const userId = searchParams.get('userId');

    if (!month || !userId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Error: Month and User ID are required to generate a payslip.</p>
            </div>
        );
    }
    
    return <PayslipView schoolId={params.id} month={month} userId={userId} />;
}
