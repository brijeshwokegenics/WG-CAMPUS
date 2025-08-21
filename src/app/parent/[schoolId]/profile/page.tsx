

import { getStudentsByParentId } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
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

async function ProfileContent({ schoolId, parentId }: { schoolId: string, parentId: string }) {
    const studentRes = await getStudentsByParentId(schoolId, parentId);
    
    if (!studentRes.success || !studentRes.data || studentRes.data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Child Profile Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Could not find a student record linked to this parent account.</p>
                    <p className="text-xs mt-2">
                        Note to Admin: Please link a student to this parent account from the Student Management section.
                    </p>
                </CardContent>
            </Card>
        )
    }
    
    // For simplicity, this view shows the first child found. A real app might have a child switcher.
    const student = studentRes.data[0];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start space-x-6">
                    <Avatar className="h-24 w-24 border">
                        <AvatarImage src={student.photoUrl || "https://placehold.co/100x100.png"} alt={student.studentName} />
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

export default async function ParentProfilePage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;

    // DEVELOPER NOTE: This logic is a stand-in for real session management.
    // In a production app, you would get the logged-in user's ID from a secure session/cookie.
    // Here, we simulate this by trying to find a parent user. This is NOT secure for production.
    const parentMobile = "PARENT_MOBILE_PLACEHOLDER"; // This would come from the user's session
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('schoolId', '==', schoolId), where('role', '==', 'Parent'));
    const parentSnapshot = await getDocs(q);
    const parent = parentSnapshot.docs.length > 0 ? { id: parentSnapshot.docs[0].id, ...parentSnapshot.docs[0].data()} : null;

    if (!parent) {
         return (
            <Card>
                <CardHeader><CardTitle>Parent Account Not Found</CardTitle></CardHeader>
                <CardContent><p>Could not retrieve parent details. Please contact administration.</p></CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
             <Link href={`/parent/${schoolId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Parent Dashboard
            </Link>
            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileContent schoolId={schoolId} parentId={parent.id} />
            </Suspense>
        </div>
    );
}
