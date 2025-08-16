
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { Loader2, Eye, Printer, Wallet } from 'lucide-react';
import { z } from 'zod';
import { generatePayrollForMonth, getPayrollHistory } from '@/app/actions/hr';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


type PayrollRecord = { id: string; month: string; generatedOn: string; payrollData: any[] };

export function PayrollManager({ schoolId }: { schoolId: string }) {
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [history, setHistory] = useState<PayrollRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialState = { success: false, error: null, message: null };
    const [state, formAction] = useFormState(generatePayrollForMonth, initialState);

    useEffect(() => {
        async function fetchHistory() {
            setLoadingHistory(true);
            const result = await getPayrollHistory(schoolId);
            if (result.success && result.data) {
                setHistory(result.data as PayrollRecord[]);
            }
            setLoadingHistory(false);
        }
        fetchHistory();
    }, [schoolId, state.success]); // Refetch on successful generation
    
    useEffect(() => {
        if(state.message) {
            setIsSubmitting(false);
        }
    }, [state]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        formAction(formData);
    };

    return (
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Generate &amp; View Payroll</CardTitle>
                <CardDescription>Select a month to run payroll, or view previously generated records.</CardDescription>
            </CardHeader>
            <CardContent>
                 <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4 p-4 border rounded-lg mb-6">
                    {state.message && (
                        <Alert className={cn(state.success ? "border-green-500 text-green-700" : "border-destructive text-destructive", "mb-4 md:mb-0 md:w-1/3")}>
                        <AlertTitle>{state.success ? 'Success!' : 'Status'}</AlertTitle>
                        <AlertDescription>{state.message || state.error}</AlertDescription>
                        </Alert>
                    )}
                    <input type="hidden" name="schoolId" value={schoolId} />
                    <div className="space-y-2 w-full md:w-auto">
                        <Label htmlFor="month">Payroll Month</Label>
                        <Input 
                            id="month" 
                            name="month"
                            type="month" 
                            value={month} 
                            onChange={e => setMonth(e.target.value)}
                            max={format(new Date(), 'yyyy-MM')}
                        />
                    </div>
                    <Button type="submit" className="w-full md:w-auto" disabled={!month || isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isSubmitting ? 'Generating...' : <><Wallet className="mr-2 h-4 w-4" /> Generate Payroll</>}
                    </Button>
                </form>

                <h3 className="text-lg font-medium mb-2">Payroll History</h3>
                 {loadingHistory ? (
                    <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                ) : history.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Generated On</TableHead>
                                    <TableHead>Total Staff</TableHead>
                                    <TableHead>Total Net Pay</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.sort((a,b) => new Date(b.month).getTime() - new Date(a.month).getTime()).map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{format(new Date(`${record.month}-02`), 'MMMM yyyy')}</TableCell>
                                        <TableCell>{format(new Date(record.generatedOn), 'dd MMM, yyyy hh:mm a')}</TableCell>
                                        <TableCell>{record.payrollData.length}</TableCell>
                                        <TableCell className="font-semibold">
                                            {record.payrollData.reduce((acc, curr) => acc + (curr.payout?.netPayable || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ViewPayslipDialog record={record} schoolId={schoolId} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                ) : (
                     <p className="text-center text-muted-foreground py-8 border rounded-lg">No payroll history found.</p>
                )}
            </CardContent>
        </Card>
      </div>
    );
}

function ViewPayslipDialog({ record, schoolId }: { record: PayrollRecord, schoolId: string }) {

    const handlePrint = (userId: string) => {
        const printUrl = `/director/dashboard/${schoolId}/hr/payroll/print?month=${record.month}&userId=${userId}`;
        window.open(printUrl, '_blank');
    };

    return (
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> View Details
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Payroll Details: {format(new Date(`${record.month}-02`), 'MMMM yyyy')}</DialogTitle>
                    <DialogDescription>
                        Generated on {format(new Date(record.generatedOn), 'dd MMM, yyyy hh:mm a')}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Gross Salary</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead>Net Payable</TableHead>
                                <TableHead>Attendance</TableHead>
                                <TableHead className="text-right">Payslip</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {record.payrollData.map(data => (
                                <TableRow key={data.userId}>
                                    <TableCell className="font-medium">{data.name}</TableCell>
                                    <TableCell>
                                        <span className={cn('text-xs font-medium', data.error ? 'text-red-600' : 'text-green-600')}>
                                            {data.error ? data.error : data.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{data.payout?.grossSalary?.toLocaleString('en-IN') || '-'}</TableCell>
                                    <TableCell>{data.payout?.applicableDeductions?.toLocaleString('en-IN') || '-'}</TableCell>
                                    <TableCell className="font-semibold">{data.payout?.netPayable?.toLocaleString('en-IN') || '-'}</TableCell>
                                    <TableCell className="text-xs">
                                        P: {data.attendanceDetails?.presentDays + data.attendanceDetails?.leaveDays} | 
                                        A: {data.attendanceDetails?.absentDays}
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handlePrint(data.userId)}
                                            disabled={!!data.error}
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
