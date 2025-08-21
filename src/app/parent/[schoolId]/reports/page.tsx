
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, UserSquare } from 'lucide-react';
import { getStudentById, getExamTerms, getMarksForStudent } from '@/app/actions/academics';
import Link from 'next/link';
import { ReportCardGenerator } from '@/components/ReportCardGenerator';

async function ReportsContent({ schoolId, studentId }: { schoolId: string, studentId: string }) {
    const studentRes = await getStudentById(studentId, schoolId);
    
    if (!studentRes.success || !studentRes.data) {
        return <p>Could not load student data.</p>;
    }
    const student = studentRes.data;

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

export default async function ParentReportsPage({ params, searchParams }: { params: { schoolId: string }, searchParams: { studentId?: string } }) {
    const schoolId = params.schoolId;
    const studentId = searchParams.studentId;

    if (!studentId) {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <UserSquare className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Please select a child</p>
                <p className="text-sm text-muted-foreground">Use the dropdown in the header to view their report cards.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Link href={`/parent/${schoolId}/dashboard?studentId=${studentId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <ReportsContent schoolId={schoolId} studentId={studentId} />
            </Suspense>
        </div>
    );
}
