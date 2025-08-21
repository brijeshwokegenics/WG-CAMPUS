
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Wallet, Receipt, UserSquare } from 'lucide-react';
import { getStudentById } from '@/app/actions/academics';
import { getStudentFeeDetails } from '@/app/actions/finance';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

async function FeesContent({ schoolId, studentId }: { schoolId: string, studentId: string }) {
    const studentRes = await getStudentById(studentId, schoolId);
    if (!studentRes.success || !studentRes.data) {
        return <p>Could not load student data.</p>;
    }
    const student = studentRes.data;
    
    const detailsRes = await getStudentFeeDetails(schoolId, student.id);
    if (!detailsRes.success || !detailsRes.data) {
        return <p>Could not load fee details.</p>;
    }
    const { feeStatus, paymentHistory } = detailsRes.data;

    const totalDue = feeStatus.reduce((acc: number, item: any) => acc + item.totalDue, 0);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Fee Status for {student.studentName}</CardTitle>
                    <CardDescription>Total Outstanding: <span className="font-bold text-lg text-primary">{totalDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {feeStatus.map((item: any) => (
                            <AccordionItem value={item.feeHeadId} key={item.feeHeadId}>
                                <AccordionTrigger>
                                    <div className='flex justify-between w-full pr-4'>
                                        <span>{item.feeHeadName}</span>
                                        <span className={cn('font-semibold', item.totalDue > 0 ? 'text-destructive' : 'text-green-600')}>
                                            Due: {item.totalDue.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Installment</TableHead><TableHead>Payable</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {item.installments.map((inst: any) => (
                                                <TableRow key={inst.name}><TableCell>{inst.name}</TableCell><TableCell>{inst.payable}</TableCell><TableCell>{inst.paid}</TableCell><TableCell>{inst.due}</TableCell></TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Receipt /> Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-3 max-h-[450px] overflow-y-auto">
                        {paymentHistory.length > 0 ? paymentHistory.map((item: any) => (
                            <div key={item.id} className="border p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-primary">{item.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                    <p className="text-sm text-muted-foreground">Receipt: {item.receiptNumber}</p>
                                    <p className="text-xs">{format(item.paymentDate, 'dd-MMM-yyyy')} via {item.paymentMode}</p>
                                </div>
                                <Link href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${item.id}`} target="_blank">
                                    <Button variant="outline" size="sm">View Receipt</Button>
                                </Link>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-center py-8">No payment history found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function ParentFeesPage({ params, searchParams }: { params: { schoolId: string }, searchParams: { studentId?: string } }) {
    const schoolId = params.schoolId;
    const studentId = searchParams.studentId;
    
    if (!studentId) {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
                <UserSquare className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-semibold">Please select a child</p>
                <p className="text-sm text-muted-foreground">Use the dropdown in the header to view their fee details.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
             <Link href={`/parent/${schoolId}/dashboard?studentId=${studentId}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <FeesContent schoolId={schoolId} studentId={studentId} />
            </Suspense>
        </div>
    );
}
