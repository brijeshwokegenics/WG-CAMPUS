
import { getStudentById } from "@/app/actions/academics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";


function ProfileDetail({ label, value }: { label: string, value: string | undefined | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base">{value}</p>
        </div>
    );
}

export default async function StudentProfilePage({ params }: { params: { id: string; studentId: string } }) {
    const { id: schoolId, studentId } = params;
    const { success, data: student, error } = await getStudentById(studentId, schoolId);

    if (!success || !student) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Link href={`/director/dashboard/${schoolId}/academics/students`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Student List
            </Link>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between">
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
                             <p className="text-sm text-muted-foreground pt-2">Admission ID: {studentId}</p>
                        </div>
                    </div>
                    <Link href={`/director/dashboard/${schoolId}/academics/students/edit/${studentId}`} passHref>
                        <Button variant="outline" className="mt-4 md:mt-0">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
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
                            <ProfileDetail label="Aadhar Number" value={student.aadharNumber} />
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
                    
                    {/* Contact Details */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Contact Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ProfileDetail label="Address" value={student.address} />
                            <ProfileDetail label="City" value={student.city} />
                            <ProfileDetail label="State" value={student.state} />
                            <ProfileDetail label="Zip Code" value={student.zipcode} />
                        </div>
                    </div>

                    {/* Previous Academic Details */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Previous Academic Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ProfileDetail label="Previous School" value={student.previousSchool} />
                            <ProfileDetail label="Previous Class" value={student.previousClass} />
                            <ProfileDetail label="Marks/Grade" value={student.previousMarks} />
                        </div>
                    </div>
                    
                    {/* Other Details */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Other Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ProfileDetail label="Transport Required" value={student.transportRequired} />
                            <ProfileDetail label="Hostel Required" value={student.hostelRequired} />
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Documents</h3>
                        <div className="flex space-x-4">
                            {student.photoUrl && <a href={student.photoUrl} target="_blank" rel="noopener noreferrer"><Button variant="link">Photo</Button></a>}
                            {student.aadharUrl && <a href={student.aadharUrl} target="_blank" rel="noopener noreferrer"><Button variant="link">Aadhar Card</Button></a>}
                            {student.birthCertificateUrl && <a href={student.birthCertificateUrl} target="_blank" rel="noopener noreferrer"><Button variant="link">Birth Certificate</Button></a>}
                             {!student.photoUrl && !student.aadharUrl && !student.birthCertificateUrl && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
