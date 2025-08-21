

import { getStudentsByParentId, getStudentById } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Loader2, UserSquare } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';


function ProfileDetail({ label, value }: { label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value}</p>
        </div>
    );
}

async function ProfileContent({ schoolId, studentId }: { schoolId: string, studentId: string }) {
    const studentRes = await getStudentById(studentId, schoolId);
    
    if (!studentRes.success || !studentRes.data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Child Profile Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Could not find a student record with the selected ID.</p>
                </CardContent>
            </Card>
        )
    }
    
    const student = studentRes.data;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start space-x-6">
                    <Avatar className="h-24 w-24 border">
                        <AvatarImage src={student.photoUrl || "https://placehold.co/100x100.png"} alt={student.studentName} data-ai-hint="student photo" />
                        <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <CardTitle className="text-3xl">{student.studentName}</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            Class {student.className} - Section {student.section}
                        </CardDescription>
                            <p className="text-sm text-muted-foreground pt-2">Admission ID: {student.id}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Personal Details */}
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ProfileDetail label="Date of Birth" value={format(student.dob, 'PPP')} />
                        <ProfileDetail label="Gender" value={student.gender} />
                        <ProfileDetail label="Blood Group" value={student.bloodGroup} />
                        <ProfileDetail label="Admission Date" value={format(student.admissionDate, 'PPP')} />
                    </div>
                </div>

                {/* Parent/Guardian Details */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Parent/Guardian Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ProfileDetail label="Father's Name" value={student.fatherName} />
                        <ProfileDetail label="Mother's Name" value={student.motherName} />
                        <ProfileDetail label="Parent's Mobile" value={student.parentMobile} />
                        <ProfileDetail label="Parent's Email" value={student.parentEmail} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ProfileSkeleton() {
    return (
        <Card>
            <CardHeader><CardTitle>Loading Profile...</CardTitle></CardHeader>
            <CardContent className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    )
}

export default async function ParentProfilePage({ params, searchParams }: { params: { schoolId: string }, searchParams: { studentId?: string } }) {
    const schoolId = params.schoolId;
    const studentId = searchParams.studentId;

    if (!studentId) {
         return (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <UserSquare className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Please select a child</p>
                <p className="text-sm text-muted-foreground">Use the dropdown in the header to switch between your children's profiles.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
             <Link href={`/parent/${schoolId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Parent Dashboard
            </Link>
            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileContent schoolId={schoolId} studentId={studentId} />
            </Suspense>
        </div>
    );
}
