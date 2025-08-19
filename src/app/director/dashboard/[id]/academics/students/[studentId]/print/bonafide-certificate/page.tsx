
'use client';

import React, { useEffect, useState } from 'react';
import { getStudentById } from "@/app/actions/academics";
import { notFound } from "next/navigation";
import { getSchool } from '@/app/actions/school';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function BonafideCertificateView({ schoolId, studentId }: { schoolId: string, studentId: string }) {
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
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold uppercase tracking-widest">{school.schoolName}</h1>
                        <p className="text-sm text-gray-600">{school.address}, {school.city}</p>
                        <h2 className="text-2xl font-semibold mt-10 underline underline-offset-8">BONAFIDE CERTIFICATE</h2>
                    </div>

                    <div className="flex justify-between text-base mb-12">
                        <p>Serial No: _____________</p>
                        <p>Date: {format(new Date(), 'dd-MM-yyyy')}</p>
                    </div>
                    
                    <div className='space-y-6 text-lg leading-relaxed'>
                    <p>This is to certify that <strong>{student.studentName}</strong>, Son/Daughter of <strong>{student.fatherName}</strong> and <strong>{student.motherName}</strong>, is a bonafide student of this school.</p>
                    <p>He/She is studying in <strong>Class {student.className} (Section {student.section})</strong> for the academic year <strong>{new Date().getFullYear()}-{new Date().getFullYear() + 1}</strong>. His/Her admission number is <strong>{studentId}</strong>.</p>
                    <p>According to our school records, his/her date of birth is <strong>{format(student.dob, 'dd-MM-yyyy')}</strong>.</p>
                    <p>We wish him/her all the best in future endeavors.</p>
                    </div>

                    <div className="mt-24 pt-12 flex justify-end items-end text-lg">
                        <div>
                            <p className="border-t-2 border-black pt-2 px-8 text-center">Principal's Signature</p>
                            <p className='text-center'>(With School Seal)</p>
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

export default function BonafideCertificatePrintPage({ params }: { params: { id: string; studentId: string } }) {
    const { id: schoolId, studentId } = params;

    async function checkStudent() {
        const { success } = await getStudentById(studentId, schoolId);
        if (!success) {
            notFound();
        }
    }
    checkStudent();
    
    return <BonafideCertificateView schoolId={schoolId} studentId={studentId} />;
}
