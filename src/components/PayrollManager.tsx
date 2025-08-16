
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { Loader2, FileText, ChevronRight, Eye } from 'lucide-react';
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formAction(formData);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generate Payroll Section */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Generate New Payroll</CardTitle>
                        <CardDescription>Select a month and year to run the payroll process.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                             {state.message && (
                                <Alert className={cn(state.success ? "border-green-500 text-green-700" : "border-destructive text-destructive", "mb-4")}>
                                <AlertTitle>{state.success ? 'Success!' : 'Status'}</AlertTitle>
                                <AlertDescription>{state.message || state.error}</AlertDescription>
                                </Alert>
                            )}
                            <input type="hidden" name="schoolId" value={schoolId} />
                            <div className="space-y-2">
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
                            <Button type="submit" className="w-full">
                                <ChevronRight className="mr-2 h-4 w-4" />
                                Generate Payroll
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Payroll History Section */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payroll History</CardTitle>
                        <CardDescription>View previously generated payroll records.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {loadingHistory ? (
                            <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
                        ) : history.length > 0 ? (
                            <div className="max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Generated On</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map(record => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">{format(new Date(record.month), 'MMMM yyyy')}</TableCell>
                                                <TableCell>{format(new Date(record.generatedOn), 'dd MMM, yyyy hh:mm a')}</TableCell>
                                                <TableCell className="text-right">
                                                    <ViewPayslipDialog record={record} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        ) : (
                             <p className="text-center text-muted-foreground py-8">No payroll history found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ViewPayslipDialog({ record }: { record: PayrollRecord }) {
    return (
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> View
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Payroll Details: {format(new Date(record.month), 'MMMM yyyy')}</DialogTitle>
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
                                    <TableCell>{data.salaryDetails?.totalDeductions?.toLocaleString('en-IN') || '-'}</TableCell>
                                    <TableCell className="font-semibold">{data.payout?.netPayable?.toLocaleString('en-IN') || '-'}</TableCell>
                                    <TableCell className="text-xs">
                                        P: {data.attendanceDetails?.presentDays} | 
                                        A: {data.attendanceDetails?.absentDays} | 
                                        L: {data.attendanceDetails?.leaveDays}
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
