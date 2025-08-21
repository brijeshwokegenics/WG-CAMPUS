
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Book, FileText, Download } from 'lucide-react';
import { getStudentsByParentId, getStudyMaterials, getHomework } from '@/app/actions/academics';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

async function ElearningContent({ schoolId, parentId }: { schoolId: string, parentId: string }) {
    const studentRes = await getStudentsByParentId(schoolId, parentId);
    if (!studentRes.success || !studentRes.data || studentRes.data.length === 0) {
        return <p>No student linked to this account.</p>;
    }
    const student = studentRes.data[0];

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

export default async function ParentElearningPage({ params }: { params: { schoolId: string } }) {
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
                <ElearningContent schoolId={schoolId} parentId={parent.id} />
            </Suspense>
        </div>
    );
}

    