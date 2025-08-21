
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getStudentsByParentId, getExamTerms, getMarksForStudent } from '@/app/actions/academics';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { ReportCardGenerator } from '@/components/ReportCardGenerator';

async function ReportsContent({ schoolId, parentId }: { schoolId: string, parentId: string }) {
    const studentRes = await getStudentsByParentId(schoolId, parentId);
    
    if (!studentRes.success || !studentRes.data || studentRes.data.length === 0) {
        return <p>No student linked to this account.</p>;
    }
    const student = studentRes.data[0];

    const termsRes = await getExamTerms(schoolId);
    const allExamTerms = termsRes.success ? termsRes.data : [];

    // Fetch all marks for the student for all available terms to see which ones are "generated"
    const marksPromises = allExamTerms.map(term => getMarksForStudent(schoolId, term.id, student.id));
    const marksResults = await Promise.all(marksPromises);

    const generatedTermIds = new Set(
        marksResults.map((res, index) => res.success && res.data ? allExamTerms[index].id : null).filter(Boolean)
    );

    const generatedExamTerms = allExamTerms.filter(term => generatedTermIds.has(term.id));


    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Cards for {student.studentName}</CardTitle>
                <CardDescription>Select one or more available exam terms to generate a combined report card.</CardDescription>
            </CardHeader>
            <CardContent>
                {generatedExamTerms.length > 0 ? (
                    <ReportCardGenerator schoolId={schoolId} classes={[student.className]} examTerms={generatedExamTerms} initialStudent={student} />
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No report cards have been generated for {student.studentName} yet.</p>
                    </div>
                )}
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
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <ReportsContent schoolId={schoolId} parentId={parent.id} />
            </Suspense>
        </div>
    );
}
