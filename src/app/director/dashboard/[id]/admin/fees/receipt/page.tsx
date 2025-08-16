
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFeeReceipt } from '@/app/actions/finance';
import { getSchool } from '@/app/actions/school';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import numberToWords from 'number-to-words';

function FeeReceiptView({ receiptId }: { receiptId: string }) {
    const [receipt, setReceipt] = useState<any>(null);
    const [school, setSchool] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const receiptRes = await getFeeReceipt(receiptId);
            
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
    }, [receiptId]);

    useEffect(() => {
        if (!loading && receipt && school) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading, receipt, school]);

    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Receipt...</div>;
    }

    if (!receipt || !school) {
        return <div className="p-8 text-center">Could not load receipt data.</div>;
    }
    
    const netAmount = (receipt.totalAmount || 0) - (receipt.discount || 0) + (receipt.fine || 0);

    return (
        <div className="bg-white min-h-screen p-4 sm:p-8 flex items-center justify-center font-sans">
            <style type="text/css" media="print">
              {`
                @page { size: A5; margin: 0; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
                .receipt-container {
                    margin: 0;
                    box-shadow: none;
                    border: none;
                    border-radius: 0;
                    height: 100%;
                 }
              `}
            </style>
            
            <div className="receipt-container w-full max-w-lg bg-white shadow-lg border">
                <div className="p-6">
                    <div className="text-center mb-6 border-b-2 border-dashed pb-4">
                        <h1 className="text-2xl font-bold uppercase">{school.schoolName}</h1>
                        <p className="text-xs text-gray-600 mt-1">{school.address}, {school.city}</p>
                        <h2 className="text-lg font-semibold mt-2">Fee Receipt</h2>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p><strong>Receipt No:</strong> <span className='font-mono'>{receipt.receiptNumber}</span></p>
                        <p><strong>Date:</strong> {format(receipt.paymentDate.toDate(), 'dd-MMM-yyyy')}</p>
                        <p><strong>Student Name:</strong> <span className='font-semibold'>{receipt.student.studentName}</span></p>
                        <p><strong>Admission ID:</strong> {receipt.studentId}</p>
                        <p><strong>Class:</strong> {receipt.student.className} - {receipt.student.section}</p>
                    </div>

                    <table className="w-full text-sm mb-4">
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className="py-2 px-1 text-left font-semibold">Sr.</th>
                                <th className="py-2 px-1 text-left font-semibold">Particulars</th>
                                <th className="py-2 px-1 text-right font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.paidFor.map((item: any, index: number) => (
                                <tr key={item.feeHeadId} className="border-b">
                                    <td className="py-2 px-1">{index + 1}</td>
                                    <td className="py-2 px-1">{item.feeHeadName}</td>
                                    <td className="py-2 px-1 text-right">{item.amount.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-semibold">
                             <tr>
                                <td colSpan={2} className="pt-4 pr-1 text-right">Total:</td>
                                <td className="pt-4 pl-1 text-right">{receipt.totalAmount.toLocaleString('en-IN')}</td>
                            </tr>
                            {receipt.discount > 0 && (
                                <tr>
                                    <td colSpan={2} className="pr-1 text-right">Discount:</td>
                                    <td className="pl-1 text-right text-green-600">(-) {receipt.discount.toLocaleString('en-IN')}</td>
                                </tr>
                            )}
                             {receipt.fine > 0 && (
                                <tr>
                                    <td colSpan={2} className="pr-1 text-right">Fine:</td>
                                    <td className="pl-1 text-right text-red-600">(+) {receipt.fine.toLocaleString('en-IN')}</td>
                                </tr>
                            )}
                             <tr className='border-t-2 border-black'>
                                <td colSpan={2} className="pt-2 pr-1 text-right text-base">Net Amount Paid:</td>
                                <td className="pt-2 pl-1 text-right text-base">{netAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                            </tr>
                        </tfoot>
                    </table>
                     
                    <p className="text-xs capitalize">
                        <strong>Amount in Words:</strong> Rupees {numberToWords.toWords(netAmount)} Only
                    </p>
                    <p className="text-xs mt-1">
                        <strong>Payment Mode:</strong> {receipt.paymentMode} {receipt.transactionId && `(${receipt.transactionId})`}
                    </p>

                    <div className="mt-16 pt-4 text-center text-xs text-gray-500">
                        <p>This is a computer-generated receipt and does not require a signature.</p>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-4 right-4 no-print space-x-2">
                 <Button onClick={() => window.print()}>Print Receipt</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </div>
    );
}

export default function FeeReceiptPrintPage() {
    const searchParams = useSearchParams();
    const receiptId = searchParams.get('id');

    if (!receiptId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Error: Receipt ID is missing.</p>
            </div>
        );
    }
    
    return <FeeReceiptView receiptId={receiptId} />;
}
