
import { getStudentById } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";


function ProfileDetail({ label, value }: { label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value}</p>
        </div>
    );
}

async function ProfileContent({ schoolId }: { schoolId: string }) {
    // This is a placeholder. In a real app, you would get the logged-in parent's ID,
    // find their linked student, and then fetch that student's data.
    // For this prototype, we'll just fetch a student directly. A developer will need to implement the real logic.
    const studentId = "STUDENT_ID_PLACEHOLDER"; // DEVELOPER NOTE: Replace with logic to find linked student.
    
    // In a real implementation, you'd find the student via the parentId on the student record.
    // For now, we can't do this, so the page will show a placeholder or the first student.
    // This part of the code is intentionally left to show a non-functional state.
    const student = null;


    if (!student) {
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
                            <p className="text-sm text-muted-foreground pt-2">Admission ID: {studentId}</p>
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

export default async function ParentProfilePage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    return (
        <div className="space-y-6">
             <Link href={`/director/dashboard/${schoolId}/parent/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Parent Dashboard
            </Link>
            <Suspense fallback={<ProfileSkeleton />}>
                <ProfileContent schoolId={schoolId} />
            </Suspense>
        </div>
    );
}
