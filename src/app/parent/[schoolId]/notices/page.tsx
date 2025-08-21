
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Megaphone } from 'lucide-react';
import { getStudentsByParentId } from '@/app/actions/academics';
import { getNotices } from '@/app/actions/communication';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

async function NoticesContent({ schoolId, students }: { schoolId: string, students: any[] }) {
    if (!students || students.length === 0) return null;

    const allNotices = await getNotices(schoolId);
    
    const studentClassNames = new Set(students.map(s => s.className));

    const relevantNotices = allNotices.filter(notice => {
        return notice.audience.some(aud => 
            aud === 'All' || 
            aud === 'Students' || 
            studentClassNames.has(aud)
        );
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notice Board</CardTitle>
                <CardDescription>Announcements and notices relevant to your children.</CardDescription>
            </CardHeader>
            <CardContent>
                {relevantNotices.length > 0 ? (
                    <div className="space-y-4">
                        {relevantNotices.map(notice => (
                            <div key={notice.id} className="border p-4 rounded-lg">
                                <h3 className="font-semibold">{notice.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    <span>Posted on {format(notice.postedAt, 'dd MMM, yyyy')} | </span>
                                    <span>Audience: {notice.audience.map(aud => <Badge key={aud} variant="secondary" className="ml-1">{aud}</Badge>)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-muted/50 rounded-lg">
                        <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No notices available</h3>
                        <p className="mt-1 text-sm text-muted-foreground">There are currently no notices for your children's classes.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}


export default async function ParentNoticesPage({ params, searchParams }: { params: { schoolId: string }, searchParams: { studentId?: string } }) {
    const schoolId = params.schoolId;
    const studentId = searchParams.studentId;
    const studentQuery = studentId ? `?studentId=${studentId}` : '';

    const parentSnapshot = await getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'Parent')));
    const parent = parentSnapshot.docs.length > 0 ? { id: parentSnapshot.docs[0].id } : null;

    if (!parent) return <p>Parent account not found.</p>;

    const studentRes = await getStudentsByParentId(schoolId, parent.id);
    const students = studentRes.success ? studentRes.data : [];

    return (
        <div className="space-y-6">
             <Link href={`/parent/${schoolId}/dashboard${studentQuery}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <NoticesContent schoolId={schoolId} students={students} />
            </Suspense>
        </div>
    );
}
