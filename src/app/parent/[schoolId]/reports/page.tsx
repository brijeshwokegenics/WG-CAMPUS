
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { getStudentsByParentId, getExamTerms } from '@/app/actions/academics';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { ReportCardGenerator } from '@/components/ReportCardGenerator';

async function ReportsContent({ schoolId, parentId }: { schoolId: string, parentId: string }) {
    const studentRes = await getStudentsByParentId(schoolId, parentId);
    const termsRes = await getExamTerms(schoolId);
    
    if (!studentRes.success || !studentRes.data || studentRes.data.length === 0) {
        return <p>No student linked to this account.</p>;
    }
    const student = studentRes.data[0];
    const examTerms = termsRes.success ? termsRes.data : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Cards for {student.studentName}</CardTitle>
                <CardDescription>Select one or more exam terms to generate a combined report card.</CardDescription>
            </CardHeader>
            <CardContent>
                <ReportCardGenerator schoolId={schoolId} classes={[student.className]} examTerms={examTerms} initialStudent={student} />
            </CardContent>
        </Card>
    );
}

export default async function ParentReportsPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;
    const parentSnapshot = await getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'Parent')));
    const parent = parentSnapshot.docs.length > 0 ? { id: parentSnapshot.docs[0].id } : null;

    if (!parent) return <p>Parent account not found.</p>;

    return (
        <div className="space-y-6">
            <Link href={`/parent/${schoolId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <ReportsContent schoolId={schoolId} parentId={parent.id} />
            </Suspense>
        </div>
    );
}

    