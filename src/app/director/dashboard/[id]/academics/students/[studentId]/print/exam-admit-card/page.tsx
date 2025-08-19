
'use client';

import React, { useEffect, useState } from 'react';
import { getStudentById } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { getSchool } from '@/app/actions/school';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function ExamAdmitCardView({ schoolId, studentId }: { schoolId: string, studentId: string }) {
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
    
    if(!student.feesPaid) {
         return <div className="p-8 text-center text-red-600 font-bold">Cannot generate admit card. Fees are pending for this student.</div>;
    }

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <style type="text/css" media="print">
              {`
                @page { size: A5 landscape; margin: 0; }
                body { -webkit-print-color-adjust: exact; }
              `}
            </style>
            
            <div className="print-container">
                <div className="admit-card p-6 rounded-lg w-[7in] h-[5in] bg-white flex flex-col border-2 border-black">
                    <div className="text-center border-b-2 border-black pb-4 mb-6">
                        <h1 className="text-2xl font-bold uppercase tracking-widest">{school.schoolName}</h1>
                        <p className="text-sm text-gray-600">{school.address}, {school.city}</p>
                        <h2 className="text-xl font-semibold mt-4 bg-gray-200 py-1">EXAM ADMIT CARD</h2>
                    </div>

                    <div className="flex gap-6 flex-grow">
                        <div className='flex-grow space-y-4 text-sm'>
                            <div className='flex'>
                                <p className='w-32 font-semibold'>Admission ID:</p>
                                <p className='font-mono'>{studentId}</p>
                            </div>
                            <div className='flex'>
                                <p className='w-32 font-semibold'>Student Name:</p>
                                <p className='font-bold'>{student.studentName}</p>
                            </div>
                            <div className='flex'>
                                <p className='w-32 font-semibold'>Class & Section:</p>
                                <p>{student.className} - {student.section}</p>
                            </div>
                            <div className='flex'>
                                <p className='w-32 font-semibold'>Father's Name:</p>
                                <p>{student.fatherName}</p>
                            </div>
                        </div>
                        <div className='flex-shrink-0'>
                            <Avatar className="h-32 w-28 border-2 border-black rounded-sm p-1">
                                <AvatarImage src={student.photoUrl || "https://placehold.co/112x128.png"} alt={student.studentName} />
                                <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 text-xs">
                        <h3 className="font-bold text-sm mb-2">Instructions for Candidate:</h3>
                        <ul className="list-decimal list-inside space-y-1 text-gray-700">
                            <li>Candidate must bring this card to the examination hall.</li>
                            <li>No electronic devices are permitted inside the examination hall.</li>
                            <li>Candidate should arrive at the examination center at least 30 minutes before the commencement of the exam.</li>
                            <li>This card is not transferable. Any alteration made on this card will render it invalid.</li>
                        </ul>
                    </div>
                    
                    <div className="mt-16 flex justify-between items-end">
                        <div>
                            <p className="text-sm border-t-2 border-black pt-1 px-4">Candidate's Signature</p>
                        </div>
                        <div>
                            <p className="text-sm border-t-2 border-black pt-1 px-4">Principal's Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-4 right-4 space-x-2">
                 <Button onClick={() => window.print()}>Print</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </>
    );
}


export default function ExamAdmitCardPrintPage({ params }: { params: { id: string; studentId: string } }) {
    const { id: schoolId, studentId } = params;

    async function checkStudent() {
        const { success } = await getStudentById(studentId, schoolId);
        if (!success) {
            notFound();
        }
    }
    checkStudent();
    
    return <ExamAdmitCardView schoolId={schoolId} studentId={studentId} />;
}
