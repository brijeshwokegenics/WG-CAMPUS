
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
    
    const passHolderName = pass.passHolderName;
    const passHolderDetails = pass.passHolderDetails;
    const photoUrl = pass.student?.photoUrl; // photo only exists for students
    const fallbackChar = passHolderName?.charAt(0) || '?';

    return (
        <>
             <style type="text/css" media="print">{`
                @page { size: A6 landscape; margin: 0; }
                body { -webkit-print-color-adjust: exact; background: white; }
                .no-print { display: none; }
                 .gate-pass-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100vw;
                    height: 100vh;
                }
                .gate-pass { 
                    transform: scale(1);
                    box-shadow: none;
                    border: 1px solid black;
                 }
            `}</style>
             
             <div className="gate-pass-container bg-gray-100 flex items-center justify-center min-h-screen">
                 <div className="gate-pass w-[5.8in] h-[4.1in] bg-white shadow-lg border p-4 flex flex-col">
                     <div className="text-center mb-4 border-b-2 border-dashed pb-2">
                        <h1 className="text-xl font-bold uppercase">{school.schoolName}</h1>
                        <p className="text-xs text-gray-500">{school.address}</p>
                        <h2 className="text-md font-semibold mt-1 uppercase">{pass.passType}</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm flex-grow">
                        <div className="col-span-2 space-y-2">
                            <p><strong>Pass Holder:</strong> {passHolderName}</p>
                            <p><strong>Details:</strong> {passHolderDetails}</p>
                            <p><strong>Reason:</strong> {pass.reason}</p>
                            <p><strong>Date:</strong> {format(pass.passDate, 'dd-MMM-yyyy')}</p>
                            <p><strong>Out Time:</strong> {pass.outTime}</p>
                            <p><strong>Duration:</strong> {pass.passDuration || 'N/A'}</p>
                            <p><strong>Session:</strong> {pass.session || 'N/A'}</p>
                        </div>
                        <div className="col-span-1 flex items-start justify-center">
                            <Avatar className="h-20 w-20 border">
                                <AvatarImage src={photoUrl || ''} alt={passHolderName} />
                                <AvatarFallback>{fallbackChar}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <div className="mt-auto pt-8 flex justify-between text-xs">
                        <div className="text-center">
                            <p className="border-t border-gray-400 pt-1 px-4">Holder's Signature</p>
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
             </div>

             <div className="fixed bottom-4 right-4 no-print space-x-2">
                 <Button onClick={() => window.print()}>Print Pass</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
            </div>
        </>
    )
}
