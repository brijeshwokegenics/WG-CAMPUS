
'use client';

import React, { useEffect } from 'react';
import { getStudentById } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { useWindowSize } from 'use-debounce';

function ProfileDetail({ label, value }: { label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1 text-sm">
            <p className="font-medium text-gray-500">{label}</p>
            <p className="text-base text-black">{value}</p>
        </div>
    );
}

// We can't use async component with `window.print()` directly in `useEffect`
// So we create a client component that fetches data
function StudentPrintView({ schoolId, studentId }: { schoolId: string, studentId: string }) {
    const [student, setStudent] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        async function fetchData() {
            const { success, data } = await getStudentById(studentId, schoolId);
            if (success && data) {
                setStudent(data);
            } else {
                setStudent(null);
            }
            setLoading(false);
        }
        fetchData();
    }, [studentId, schoolId]);

    useEffect(() => {
        if (student) {
            // Delay print to allow content to render
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [student]);

    if (loading) {
        return <div className="p-8 text-center">Loading student data for printing...</div>;
    }

    if (!student) {
        // This will be caught by the parent notFound(), but as a fallback
        return <div className="p-8 text-center">Student not found.</div>;
    }

    return (
        <div className="bg-white text-black p-8 font-sans">
             <style type="text/css" media="print">
              {`
                @page { size: auto;  margin: 20mm; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
              `}
            </style>

            <div className="text-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold">Student Profile</h1>
                {/* You might want to fetch and display School Name here */}
                <p className="text-lg">WG Campus</p>
            </div>

            <div className="flex items-start space-x-8 mb-8">
                <Avatar className="h-32 w-32 border">
                    <AvatarImage src={student.photoUrl || "https://placehold.co/128x128.png"} alt={student.studentName} />
                    <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-grow">
                    <h2 className="text-4xl font-bold">{student.studentName}</h2>
                    <p className="text-xl text-gray-600">
                        Class {student.className} - Section {student.section}
                    </p>
                     <p className="text-md text-gray-500 pt-2">Admission ID: {studentId}</p>
                </div>
            </div>
            
            {/* Personal Details */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-3 gap-6">
                    <ProfileDetail label="Date of Birth" value={format(student.dob, 'PPP')} />
                    <ProfileDetail label="Gender" value={student.gender} />
                    <ProfileDetail label="Blood Group" value={student.bloodGroup} />
                    <ProfileDetail label="Admission Date" value={format(student.admissionDate, 'PPP')} />
                    <ProfileDetail label="Aadhar Number" value={student.aadharNumber} />
                </div>
            </div>

            {/* Parent/Guardian Details */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Parent/Guardian Details</h3>
                <div className="grid grid-cols-3 gap-6">
                    <ProfileDetail label="Father's Name" value={student.fatherName} />
                    <ProfileDetail label="Mother's Name" value={student.motherName} />
                    <ProfileDetail label="Parent's Mobile" value={student.parentMobile} />
                    <ProfileDetail label="Parent's Email" value={student.parentEmail} />
                </div>
            </div>
            
            {/* Contact Details */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Contact Details</h3>
                 <div className="grid grid-cols-3 gap-6">
                    <ProfileDetail label="Address" value={student.address} />
                    <ProfileDetail label="City" value={student.city} />
                    <ProfileDetail label="State" value={student.state} />
                    <ProfileDetail label="Zip Code" value={student.zipcode} />
                </div>
            </div>

            <div className="mt-16 text-center text-xs text-gray-500 no-print">
                <p>This is a computer-generated document. You can close this window after printing.</p>
                 <button onClick={() => window.close()} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
        </div>
    );
}


export default function StudentPrintPage({ params }: { params: { id: string; studentId: string } }) {
    const { id: schoolId, studentId } = params;

    // A check to ensure student exists before rendering the client component
    // This is a bit redundant with the client fetch, but good for initial guard
    async function checkStudent() {
        const { success } = await getStudentById(studentId, schoolId);
        if (!success) {
            notFound();
        }
    }
    checkStudent();
    
    return <StudentPrintView schoolId={schoolId} studentId={studentId} />;
}
