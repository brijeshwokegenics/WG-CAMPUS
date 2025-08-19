
'use client';

import React, { useEffect, useState } from 'react';
import { getStudentById } from "@/app/actions/academics";
import { notFound } from "next/navigation";
import { getSchool } from '@/app/actions/school';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function TransferCertificateView({ schoolId, studentId }: { schoolId: string, studentId: string }) {
    const [student, setStudent] = useState<any>(null);
    const [school, setSchool] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const studentRes = await getStudentById(studentId, schoolId);
            const schoolRes = await getSchool(schoolId);
            
            if (studentRes.success && studentRes.data) {
                setStudent(studentRes.data);
            }
            if (schoolRes.school) {
                setSchool(schoolRes.school);
            }
            setLoading(false);
        }
        fetchData();
    }, [studentId, schoolId]);

    useEffect(() => {
        if (!loading && student && school) {
            setTimeout(() => window.print(), 500);
        }
    }, [loading, student, school]);

    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="h-6 w-6 animate-spin"/> Loading...</div>;
    }

    if (!student || !school) {
        return <div className="p-8 text-center">Could not load student or school data.</div>;
    }

    return (
        <div className="bg-gray-100 p-8">
             <style type="text/css" media="print">
              {`
                @page { size: A4; margin: 25mm; }
                body { -webkit-print-color-adjust: exact; background: white; color: black; }
              `}
            </style>
            
             <div className="print-container bg-white text-black font-serif shadow-lg">
                <div className="p-8 border-2 border-black">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold uppercase tracking-widest">{school.schoolName}</h1>
                        <p className="text-sm text-gray-600">{school.address}, {school.city}</p>
                        <h2 className="text-2xl font-semibold mt-6 underline underline-offset-4">TRANSFER CERTIFICATE</h2>
                    </div>

                    <div className="flex justify-between text-sm mb-8">
                        <p>Affiliation No: _______________</p>
                        <p>School Code: {school.schoolId}</p>
                    </div>
                    <div className="flex justify-between text-sm mb-8">
                        <p>Book No: _______________</p>
                        <p>Serial No: _______________</p>
                        <p>Admission No: {studentId}</p>
                    </div>

                    <div className='space-y-4 text-base'>
                        <div className='flex'>
                            <p className='w-64'>1. Name of Pupil:</p>
                            <p className='font-semibold'>{student.studentName}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>2. Mother's Name:</p>
                            <p className='font-semibold'>{student.motherName}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>3. Father's Name:</p>
                            <p className='font-semibold'>{student.fatherName}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>4. Date of Birth (in figures):</p>
                            <p className='font-semibold'>{format(student.dob, 'dd-MM-yyyy')}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>5. Nationality:</p>
                            <p className='font-semibold'>Indian</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>6. Date of first admission in the School with class:</p>
                            <p className='font-semibold'>{format(student.admissionDate, 'dd-MM-yyyy')}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>7. Class in which the pupil last studied:</p>
                            <p className='font-semibold'>{student.className}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>8. Whether failed, if so once/twice in the same class:</p>
                            <p className='font-semibold'>No</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>9. Month up to which the pupil has paid school dues:</p>
                            <p className='font-semibold'>March</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>10. General conduct:</p>
                            <p className='font-semibold'>Good</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>11. Date of application for certificate:</p>
                            <p className='font-semibold'>{format(new Date(), 'dd-MM-yyyy')}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>12. Date of issue of certificate:</p>
                            <p className='font-semibold'>{format(new Date(), 'dd-MM-yyyy')}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-64'>13. Reason for leaving the school:</p>
                            <p className='font-semibold'>Parent's Request</p>
                        </div>
                    </div>

                    <div className="mt-24 flex justify-between items-end text-sm">
                        <div>
                            <p>Checked By</p>
                            <p>(State full name and designation)</p>
                        </div>
                        <div>
                            <p className="border-t-2 border-black pt-1">Principal's Signature</p>
                            <p className='text-center'>(With Seal)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-4 right-4 space-x-2">
                 <Button onClick={() => window.print()}>Print</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </div>
    );
}

export default function TCPrintPage({ params }: { params: { id: string; studentId: string } }) {
    const { id: schoolId, studentId } = params;

    async function checkStudent() {
        const { success } = await getStudentById(studentId, schoolId);
        if (!success) {
            notFound();
        }
    }
    checkStudent();
    
    return <TransferCertificateView schoolId={schoolId} studentId={studentId} />;
}
