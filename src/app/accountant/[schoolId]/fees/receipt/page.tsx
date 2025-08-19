
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFeeReceipt } from '@/app/actions/finance';
import { getSchool } from '@/app/actions/school';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { numberToWords } from 'number-to-words';

type ReceiptData = any;
type SchoolData = any;

function ReceiptView({ receiptId, schoolId }: { receiptId: string, schoolId: string }) {
    const [receipt, setReceipt] = useState<ReceiptData>(null);
    const [school, setSchool] = useState<SchoolData>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const receiptRes = await getFeeReceipt(receiptId, schoolId);
            if (receiptRes.success && receiptRes.data) {
                setReceipt(receiptRes.data);
                const schoolRes = await getSchool(receiptRes.data.schoolId);
                if (schoolRes.school) {
                    setSchool(schoolRes.school);
                }
            }
            setLoading(false);
        }
        fetchData();
    }, [receiptId, schoolId]);

    useEffect(() => {
        if (!loading && receipt && school) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading, receipt, school]);
    
    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Receipt...</div>;
    }

    if (!receipt || !school) {
        return <div className="p-8 text-center">Could not load receipt data. It may have been deleted.</div>;
    }
    
    const amountInWords = numberToWords.toWords(receipt.totalAmount);

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
            <style type="text/css" media="print">
              {`
                @page { size: A5; margin: 0; }
                body { -webkit-print-color-adjust: exact; }
              `}
            </style>
            
            <div className="print-container w-full max-w-lg bg-white shadow-lg border-2 border-black">
                <div className="p-6">
                    <div className="text-center mb-6 border-b-2 border-dashed border-black pb-4">
                        <h1 className="text-2xl font-bold uppercase">{school.schoolName}</h1>
                        <p className="text-xs text-gray-600 mt-1">{school.address}, {school.city}, {school.state} - {school.zipcode}</p>
                        <h2 className="text-lg font-semibold mt-2">Fee Receipt</h2>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p><strong>Receipt No:</strong> <span className='font-mono'>{receipt.receiptNumber}</span></p>
                        <p><strong>Date:</strong> {format(receipt.paymentDate, 'dd-MMM-yyyy')}</p>
                        <p><strong>Student Name:</strong> <span className='font-semibold'>{receipt.student.studentName}</span></p>
                        <p><strong>Admission ID:</strong> {receipt.studentId}</p>
                        <p><strong>Class:</strong> {receipt.student.className} - {receipt.student.section}</p>
                        <p><strong>Father's Name:</strong> {receipt.student.fatherName}</p>
                        <p><strong>Mother's Name:</strong> {receipt.student.motherName}</p>
                    </div>

                    <table className="w-full text-sm border-y-2 border-dashed border-black my-4">
                        <thead>
                            <tr className='border-b-2 border-dashed border-black'>
                                <th className="p-2 text-left w-12">Sr.</th>
                                <th className="p-2 text-left">Particulars</th>
                                <th className="p-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.paidFor.map((item: any, index: number) => (
                                <tr key={index}>
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{item.feeHeadName}</td>
                                    <td className="p-2 text-right">{item.amount.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="grid grid-cols-2 text-sm gap-x-4 mb-4">
                        <div className="space-y-1">
                            <p><strong>Discount:</strong> {receipt.discount ? `₹${receipt.discount.toLocaleString('en-IN')}`: 'N/A'}</p>
                             <p><strong>Fine:</strong> {receipt.fine ? `₹${receipt.fine.toLocaleString('en-IN')}`: 'N/A'}</p>
                        </div>
                        <div className='text-right font-semibold space-y-1'>
                            <p>Total: {receipt.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    
                    <div className='border-t-2 border-dashed border-black pt-4'>
                         <p className="text-right font-bold text-lg">Net Amount Paid: {receipt.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                        <p className='text-sm mt-1'><strong>Amount in Words:</strong> Rupees {amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} Only</p>
                        <p className='text-sm mt-1'><strong>Payment Mode:</strong> {receipt.paymentMode}</p>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-8">
                        This is a computer-generated receipt and does not require a signature.
                    </div>
                </div>
            </div>

             <div className="fixed bottom-4 right-4 space-x-2">
                 <Button onClick={() => window.print()}>Print Receipt</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </div>
    );
}


export default function FeeReceiptPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    const searchParams = useSearchParams();
    const receiptId = searchParams.get('id');

    if (!receiptId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Error: Receipt ID is required.</p>
            </div>
        );
    }
    
    return <ReceiptView receiptId={receiptId} schoolId={schoolId} />;
}
