
'use client';

import React, { useEffect, useState } from 'react';
import { getStudentById } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { getSchool } from '@/app/actions/school';

function IDCardView({ schoolId, studentId }: { schoolId: string, studentId: string }) {
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
        return <div className="p-8 text-center">Loading ID Card...</div>;
    }

    if (!student || !school) {
        return <div className="p-8 text-center">Could not load student or school data.</div>;
    }

    return (
        <div className="bg-white text-black font-sans flex items-center justify-center min-h-screen">
             <style type="text/css" media="print">
              {`
                @page { size: 85.6mm 53.98mm; margin: 0; }
                body { -webkit-print-color-adjust: exact; background: white; }
                .no-print { display: none; }
                .id-card {
                    transform: scale(1);
                    border: 1px solid #ccc;
                    box-shadow: none;
                }
              `}
            </style>
            
            <div className="id-card w-[325px] h-[204px] border rounded-xl shadow-lg flex flex-col p-3 bg-slate-50 relative overflow-hidden">
                {/* Header */}
                <div className='flex items-center gap-2 border-b pb-2'>
                     <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src="/school-logo.png" alt="School Logo" />
                        <AvatarFallback>SL</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-[11px] font-bold text-primary uppercase tracking-wider">{school.schoolName}</h1>
                        <p className='text-[8px] text-gray-500 -mt-0.5'>{school.address}, {school.city}</p>
                    </div>
                </div>

                {/* Body */}
                <div className='flex gap-3 pt-3'>
                    <div className='flex-shrink-0'>
                        <Avatar className="h-24 w-20 border-2 border-primary rounded-md">
                            <AvatarImage src={student.photoUrl || "https://placehold.co/80x96.png"} alt={student.studentName} />
                            <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className='text-[10px] space-y-1.5'>
                        <p className='font-bold text-lg text-slate-800 -mb-1'>{student.studentName}</p>
                        <div className='flex'>
                            <p className='w-16 font-semibold'>Class:</p>
                            <p>{student.className} - {student.section}</p>
                        </div>
                         <div className='flex'>
                            <p className='w-16 font-semibold'>Admission ID:</p>
                            <p className='font-mono'>{studentId}</p>
                        </div>
                        <div className='flex'>
                            <p className='w-16 font-semibold'>Mobile:</p>
                            <p>{student.parentMobile}</p>
                        </div>
                         <div className='flex'>
                            <p className='w-16 font-semibold'>Address:</p>
                            <p className='truncate'>{student.address}, {student.city}</p>
                        </div>
                    </div>
                </div>
                 {/* Footer */}
                <div className='mt-auto text-center'>
                    <p className='text-[9px] font-semibold text-slate-600'>Principal's Signature</p>
                    <p className='text-[8px] text-slate-500'>ID Card valid for the academic year</p>
                </div>
            </div>

            <div className="fixed bottom-4 right-4 no-print">
                 <p className="text-xs text-gray-500">You can close this window after printing.</p>
                 <button onClick={() => window.close()} className="mt-2 px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
        </div>
    );
}


export default function IDCardPrintPage({ params }: { params: { id: string; studentId: string } }) {
    const { id: schoolId, studentId } = params;

    // A simple guard
    async function checkStudent() {
        const { success } = await getStudentById(studentId, schoolId);
        if (!success) {
            notFound();
        }
    }
    checkStudent();
    
    return <IDCardView schoolId={schoolId} studentId={studentId} />;
}
