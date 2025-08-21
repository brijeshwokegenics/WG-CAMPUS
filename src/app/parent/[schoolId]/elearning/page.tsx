
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Book, FileText, Download, UserSquare } from 'lucide-react';
import { getStudentById, getStudyMaterials, getHomework } from '@/app/actions/academics';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

async function ElearningContent({ schoolId, studentId }: { schoolId: string, studentId: string }) {
    const studentRes = await getStudentById(studentId, schoolId);
    if (!studentRes.success || !studentRes.data) {
        return <p>Could not load student data.</p>;
    }
    const student = studentRes.data;

    const [materialsRes, homeworkRes] = await Promise.all([
        getStudyMaterials({ schoolId, classId: student.classId, section: student.section }),
        getHomework({ schoolId, classId: student.classId, section: student.section })
    ]);

    const studyMaterials = materialsRes.success ? materialsRes.data : [];
    const homeworks = homeworkRes.success ? homeworkRes.data : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>E-learning Content for {student.studentName}</CardTitle>
                <CardDescription>Class: {student.className} - {student.section}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="study-material">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="study-material"><Book className="mr-2 h-4 w-4" /> Study Material</TabsTrigger>
                        <TabsTrigger value="homework"><FileText className="mr-2 h-4 w-4" /> Homework</TabsTrigger>
                    </TabsList>
                    <TabsContent value="study-material">
                        <ContentTable content={studyMaterials} isHomework={false} />
                    </TabsContent>
                    <TabsContent value="homework">
                         <ContentTable content={homeworks} isHomework={true} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function ContentTable({ content, isHomework }: { content: any[], isHomework: boolean }) {
    return (
        <div className="border rounded-lg mt-4">
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        {isHomework && <TableHead>Submission</TableHead>}
                        <TableHead>Title</TableHead>
                        <TableHead>File</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {content.length > 0 ? content.map(item => (
                        <TableRow key={item.id}>
                            <TableCell>{format(item.date, 'dd-MMM-yy')}</TableCell>
                            {isHomework && <TableCell>{format(item.submissionDate, 'dd-MMM-yy')}</TableCell>}
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>
                                {item.fileUrl ? (
                                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm"><Download className="mr-2 h-3 w-3"/>View/Download</Button>
                                    </a>
                                ) : (
                                    <span className='text-xs text-muted-foreground'>No file</span>
                                )}
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={isHomework ? 4 : 3} className="h-24 text-center">No content found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default async function ParentElearningPage({ params, searchParams }: { params: { schoolId: string }, searchParams: { studentId?: string } }) {
    const schoolId = params.schoolId;
    const studentId = searchParams.studentId;

    if (!studentId) {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <UserSquare className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Please select a child</p>
                <p className="text-sm text-muted-foreground">Use the dropdown in the header to view their e-learning content.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Link href={`/parent/${schoolId}/dashboard?studentId=${studentId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <ElearningContent schoolId={schoolId} studentId={studentId} />
            </Suspense>
        </div>
    );
}
