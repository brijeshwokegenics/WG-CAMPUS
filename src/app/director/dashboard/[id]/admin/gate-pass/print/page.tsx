'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import { getGatePassById } from '@/app/actions/gatepass';
import { getSchool } from '@/app/actions/school';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function PrintGatePassPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    const searchParams = useSearchParams();
    const passId = searchParams.get('id');
    
    const [pass, setPass] = useState<any>(null);
    const [school, setSchool] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!passId) return setLoading(false);
            const passRes = await getGatePassById(schoolId, passId);
            if (passRes.success) {
                setPass(passRes.data);
                const schoolRes = await getSchool(schoolId);
                if (schoolRes.school) {
                    setSchool(schoolRes.school);
                }
            }
            setLoading(false);
        }
        fetchData();
    }, [schoolId, passId]);
    
    useEffect(() => {
        if (!loading && pass && school) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading, pass, school]);

    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Gate Pass...</div>;
    }
    
    if (!passId || !pass || !school) {
        return notFound();
    }


    return (
        <div className="bg-white min-h-screen p-4 sm:p-8 flex items-center justify-center font-sans text-black">
             <style type="text/css" media="print">{`
                @page { size: A6 landscape; margin: 0; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
                .gate-pass { border: 1px solid #000; box-shadow: none; transform: scale(1.1); margin: 2rem; }
            `}</style>
             <div className="gate-pass w-[450px] bg-white shadow-lg border p-4">
                 <div className="text-center mb-4 border-b-2 border-dashed pb-2">
                    <h1 className="text-xl font-bold uppercase">{school.schoolName}</h1>
                    <p className="text-xs text-gray-500">{school.address}</p>
                    <h2 className="text-md font-semibold mt-1">GATE PASS</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="col-span-2 space-y-2">
                        <p><strong>Student:</strong> {pass.student.studentName}</p>
                        <p><strong>Class:</strong> {pass.student.className} - {pass.student.section}</p>
                        <p><strong>Reason:</strong> {pass.reason}</p>
                        <p><strong>Date:</strong> {format(pass.passDate, 'dd-MMM-yyyy')}</p>
                        <p><strong>Out Time:</strong> {pass.outTime}</p>
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                        <Avatar className="h-20 w-20 border">
                            <AvatarImage src={pass.student?.photoUrl || ''} alt={pass.student?.studentName} />
                            <AvatarFallback>{pass.student?.studentName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                 <div className="mt-8 pt-8 flex justify-between text-xs">
                    <div className="text-center">
                        <p className="border-t border-gray-400 pt-1 px-4">Student's Signature</p>
                    </div>
                     <div className="text-center">
                        <p className="border-t border-gray-400 pt-1 px-4">Issued By</p>
                        <p>{pass.issuedBy}</p>
                    </div>
                    <div className="text-center">
                        <p className="border-t border-gray-400 pt-1 px-4">Principal's Signature</p>
                    </div>
                </div>
             </div>

             <div className="fixed bottom-4 right-4 no-print space-x-2">
                 <Button onClick={() => window.print()}>Print Pass</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </div>
    )
}
