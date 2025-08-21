
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Wallet, FileText, Book, Megaphone, Info } from "lucide-react";
import Link from "next/link";
import { getStudentsByParentId } from "@/app/actions/academics";
import { getNotices } from "@/app/actions/communication";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

async function Notices({ schoolId, students }: { schoolId: string, students: any[] }) {
    if (!students || students.length === 0) return null;

    const allNotices = await getNotices(schoolId);
    
    // Get all class names for the parent's children
    const studentClassNames = new Set(students.map(s => s.className));

    const relevantNotices = allNotices.filter(notice => {
        return notice.audience.some(aud => 
            aud === 'All' || 
            aud === 'Students' || 
            studentClassNames.has(aud)
        );
    }).slice(0, 4); // Show latest 4 relevant notices

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Notices</CardTitle>
                <CardDescription>Announcements relevant to your children.</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex flex-col">
                {relevantNotices.length > 0 ? (
                    <ul className="space-y-4">
                        {relevantNotices.map(notice => (
                            <li key={notice.id} className="flex items-start gap-4">
                                <div className="bg-muted p-2 rounded-full">
                                    <Megaphone className="h-5 w-5 text-primary"/>
                                </div>
                                <div>
                                    <p className="font-semibold">{notice.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Posted on {format(new Date(notice.postedAt), 'dd MMM, yyyy')} for <Badge variant="secondary">{notice.audience.join(', ')}</Badge>
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="m-auto text-center text-muted-foreground">
                        <Megaphone className="h-10 w-10 mx-auto mb-2"/>
                        <p>No recent notices</p>
                    </div>
                )}
                 <Link href={`/parent/${schoolId}/notices`} className="text-sm text-primary hover:underline mt-auto pt-4">
                    View All Notices
                </Link>
            </CardContent>
        </Card>
    )
}

export default async function ParentDashboardPage({ params, searchParams }: { params: { schoolId: string }, searchParams: { studentId?: string } }) {
    const schoolId = params.schoolId;

    // This logic is a stand-in for real authentication
    const parentSnapshot = await getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'Parent')));
    const parent = parentSnapshot.docs.length > 0 ? { id: parentSnapshot.docs[0].id } : null;
    
    if (!parent) {
         return (
            <Card>
                <CardHeader><CardTitle>Parent Account Not Found</CardTitle></CardHeader>
                <CardContent><p>Could not retrieve parent details. Please contact administration.</p></CardContent>
            </Card>
        )
    }

    const studentRes = await getStudentsByParentId(schoolId, parent.id);
    const students = studentRes.success ? studentRes.data : [];
    const studentId = searchParams.studentId || students?.[0]?.id;

    const studentQuery = studentId ? `?studentId=${studentId}` : '';

    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Parent Dashboard</h1>
                <p className="text-muted-foreground">Welcome! View your child's information and activities.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <Link href={`/parent/${schoolId}/profile${studentQuery}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Child's Profile</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View your child's details.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/attendance${studentQuery}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Check daily attendance records.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/fees${studentQuery}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Fees</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View fee dues and payment history.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/reports${studentQuery}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Report Cards</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Download academic report cards.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/elearning${studentQuery}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">E-learning & Homework</CardTitle>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Access study materials.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/parent/${schoolId}/calendar`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">School Calendar</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View school events and holidays.</p></CardContent>
                    </Card>
                </Link>
            </div>
             <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
                <Notices schoolId={schoolId} students={students} />
            </Suspense>
        </div>
    );
}

