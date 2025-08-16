
'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Search, History, Printer, HandCoins, MinusCircle, PlusCircle } from 'lucide-react';

import { getStudentsForSchool } from '@/app/actions/academics';
import { getStudentFeeDetails, collectFee } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFormState } from 'react-dom';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentSearchResult = { id: string; studentName: string; };

type FeeDetails = {
    student: any;
    feeStructure: any;
    paymentHistory: any[];
    feeStatus: any[];
}

export function FeeManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    
    return (
        <div className="space-y-6">
            {!selectedStudentId ? (
                <StudentSearch classes={classes} schoolId={schoolId} onStudentSelect={setSelectedStudentId} />
            ) : (
                <FeeDetailsDisplay 
                    schoolId={schoolId} 
                    studentId={selectedStudentId} 
                    onClear={() => setSelectedStudentId(null)} 
                />
            )}
        </div>
    );
}

function StudentSearch({ classes, schoolId, onStudentSelect }: { classes: ClassData[], schoolId: string, onStudentSelect: (id: string) => void }) {
    const [searchClassId, setSearchClassId] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
    const [isSearching, startSearchTransition] = useTransition();

    const searchClass = useMemo(() => classes.find(c => c.id === searchClassId), [classes, searchClassId]);

    const handleSearch = () => {
        if (!searchClassId || !searchSection) {
            alert("Please select both a class and a section.");
            return;
        }
        startSearchTransition(async () => {
            const students = await getStudentsForSchool({ schoolId, classId: searchClassId, section: searchSection, name: searchName });
            setSearchResults(students as StudentSearchResult[]);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Search className="mr-2 h-5 w-5" /> Find Student</CardTitle>
                <CardDescription>Search for a student to manage their fees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Select value={searchClassId} onValueChange={setSearchClassId}>
                            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Section</Label>
                        <Select value={searchSection} onValueChange={setSearchSection} disabled={!searchClassId}>
                            <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                            <SelectContent>{searchClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Student Name/ID</Label>
                        <Input value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Enter name or Admission ID" />
                    </div>
                    <div className="self-end">
                        <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                            {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search
                        </Button>
                    </div>
                </div>
                 {searchResults.length > 0 && (
                    <div className="border rounded-lg mt-4 max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Student Name</TableHead><TableHead>Admission ID</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {searchResults.map(s => (
                                    <TableRow key={s.id}><TableCell>{s.studentName}</TableCell><TableCell>{s.id}</TableCell><TableCell className="text-right"><Button size="sm" onClick={() => onStudentSelect(s.id)}>Select</Button></TableCell></TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FeeDetailsDisplay({ schoolId, studentId, onClear }: { schoolId: string, studentId: string, onClear: () => void }) {
    const [details, setDetails] = useState<FeeDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [state, formAction] = useFormState(collectFee, { success: false, message: null, error: null, receiptId: null });

    const fetchDetails = useCallback(async () => {
        setIsLoading(true);
        const result = await getStudentFeeDetails(schoolId, studentId);
        if(result.success && result.data){
            setDetails(result.data as FeeDetails);
        } else {
            setDetails(null);
        }
        setIsLoading(false);
    }, [schoolId, studentId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    useEffect(() => {
        if(state.success) {
            fetchDetails();
        }
    }, [state.success, fetchDetails]);

    if (isLoading) {
        return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!details) {
        return <div className="text-center p-8 text-destructive">Could not load fee details. <Button variant="link" onClick={onClear}>Try again</Button></div>
    }

    return (
        <div className='space-y-6'>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Fee Details for {details.student.studentName}</h2>
                <Button variant="outline" onClick={onClear}>Search for another student</Button>
            </div>
            
            <FeeStatus studentFeeStatus={details.feeStatus} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                   <FeeCollectionForm 
                        student={details.student} 
                        feeStatus={details.feeStatus} 
                        schoolId={schoolId} 
                        formAction={formAction}
                        state={state}
                    />
                </div>
                <div className="lg:col-span-2">
                    <PaymentHistory history={details.paymentHistory} schoolId={schoolId} />
                </div>
            </div>
        </div>
    );
}


const FeeCollectionFormSchema = z.object({
    paymentDate: z.date(),
    paymentMode: z.enum(['Cash', 'Cheque', 'UPI', 'Card', 'Bank Transfer']),
    transactionId: z.string().optional(),
    discount: z.coerce.number().min(0).optional(),
    fine: z.coerce.number().min(0).optional(),
    paidFor: z.array(z.object({
        feeHeadId: z.string(),
        feeHeadName: z.string(),
        amount: z.coerce.number().min(0),
        isPaid: z.boolean(),
    })).min(1, "At least one fee head must be selected for payment.").refine(items => items.some(item => item.isPaid), { message: "Please select at least one fee head to pay for."}),
});

type FeeCollectionFormValues = z.infer<typeof FeeCollectionFormSchema>;

function FeeCollectionForm({ student, feeStatus, schoolId, formAction, state }: { student: any, feeStatus: any[], schoolId: string, formAction: any, state: any }) {
    
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, reset } = useForm<FeeCollectionFormValues>({
        resolver: zodResolver(FeeCollectionFormSchema),
        defaultValues: {
            paymentDate: new Date(),
            paymentMode: "Cash",
            paidFor: []
        }
    });

    useEffect(() => {
        const defaultPaidFor = feeStatus.map((item: any) => ({
            feeHeadId: item.feeHeadId,
            feeHeadName: item.feeHeadName,
            amount: item.due > 0 ? item.due : 0,
            isPaid: item.due > 0,
        }));
        reset({
            paymentDate: new Date(),
            paymentMode: "Cash",
            transactionId: '',
            discount: 0,
            fine: 0,
            paidFor: defaultPaidFor,
        });
    }, [feeStatus, reset]);

    const watchPaidFor = watch('paidFor');
    const watchDiscount = watch('discount');
    const watchFine = watch('fine');
    
    const totalAmount = useMemo(() => {
        if (!watchPaidFor) return 0;
        return watchPaidFor.reduce((acc, curr) => curr.isPaid ? acc + Number(curr.amount || 0) : acc, 0);
    }, [watchPaidFor]);
    
    const netAmount = useMemo(() => totalAmount - (Number(watchDiscount) || 0) + (Number(watchFine) || 0), [totalAmount, watchDiscount, watchFine]);
    
    const onFormSubmit = (data: FeeCollectionFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('studentId', student.id);
        formData.append('classId', student.classId);
        formData.append('paymentDate', data.paymentDate.toISOString());
        formData.append('paymentMode', data.paymentMode);
        formData.append('transactionId', data.transactionId || '');
        formData.append('discount', String(data.discount || 0));
        formData.append('fine', String(data.fine || 0));
        
        const paidItems = data.paidFor.filter(item => item.isPaid).map(({ feeHeadId, feeHeadName, amount }) => ({ feeHeadId, feeHeadName, amount: Number(amount) }));
        if(paidItems.length === 0) {
            alert("Please select at least one fee item to pay."); return;
        }

        formData.append('paidFor', JSON.stringify(paidItems));
        formData.append('totalAmount', String(totalAmount));
        formAction(formData);
    }
    
    return (
        <Card>
            <CardHeader><CardTitle className="flex items-center"><HandCoins className="mr-2 h-5 w-5" /> New Fee Payment</CardTitle></CardHeader>
            <CardContent>
                 {state.error && <Alert variant="destructive" className="mb-4"><AlertTitle>Payment Failed</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>}
                 {state.success && state.receiptId &&
                     <Alert variant="default" className="mb-4 border-green-500">
                         <AlertTitle>Payment Successful!</AlertTitle>
                         <AlertDescription className="flex justify-between items-center">
                             <span>{state.message}</span>
                             <a href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${state.receiptId}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" /> Print Receipt</Button>
                             </a>
                         </AlertDescription>
                    </Alert>
                 }

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Select Fees to Pay</h4>
                        <div className="max-h-60 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead className="w-12"></TableHead><TableHead>Fee Head</TableHead><TableHead className="text-right">Amount To Pay</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {watch('paidFor')?.map((field, index) => (
                                        <TableRow key={field.feeHeadId}>
                                            <TableCell><Controller name={`paidFor.${index}.isPaid`} control={control} render={({ field: checkboxField }) => <Checkbox checked={checkboxField.value} onCheckedChange={checkboxField.onChange} />} /></TableCell>
                                            <TableCell className="font-medium">{field.feeHeadName}</TableCell>
                                            <TableCell className="text-right"><Controller name={`paidFor.${index}.amount`} control={control} render={({ field: amountField }) => <Input type="number" {...amountField} className="h-8 w-28 ml-auto text-right" />} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {errors.paidFor && <p className="text-sm text-destructive">{errors.paidFor.message || errors.paidFor.root?.message}</p>}
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Discount</Label><div className="relative"><MinusCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input type="number" {...register('discount')} className="pl-8" /></div></div>
                        <div className="space-y-2"><Label>Fine (Optional)</Label><div className="relative"><PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input type="number" {...register('fine')} className="pl-8" /></div></div>
                    </div>
                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Payment Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Payment Date</Label><Controller name="paymentDate" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Select Date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>)} /></div>
                            <div className="space-y-2"><Label>Payment Mode</Label><Controller name="paymentMode" control={control} render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent></Select>)} /></div>
                        </div>
                        {watch('paymentMode') !== 'Cash' && (<div className="space-y-2"><Label>Transaction/Reference ID</Label><Input {...register('transactionId')} /></div>)}
                        <div className="text-right text-xl font-bold">Net Amount: {netAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div>
                    </div>
                    <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || totalAmount === 0}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Collect Fee</Button></div>
                </form>
            </CardContent>
        </Card>
    );
}

function PaymentHistory({ history, schoolId }: { history: any[], schoolId: string }) {
    return (
        <Card>
             <CardHeader><CardTitle className="flex items-center"><History className="mr-2 h-5 w-5" /> Payment History</CardTitle></CardHeader>
            <CardContent>
                {history.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {history.map(payment => (
                            <div key={payment.id} className="border p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div><p className="font-semibold text-lg">{((payment.totalAmount || 0) - (payment.discount || 0) + (payment.fine || 0)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p><p className="text-xs text-muted-foreground">{payment.receiptNumber}</p></div>
                                    <div className="text-right"><p className="text-sm font-medium">{format(payment.paymentDate, 'dd-MMM-yyyy')}</p><p className="text-xs text-muted-foreground">{payment.paymentMode}</p></div>
                                </div>
                                <div className="mt-2 pt-2 border-t"><p className="text-xs font-semibold mb-1">Paid For:</p><ul className="text-xs text-muted-foreground list-disc list-inside">{payment.paidFor.map((item: any) => (<li key={item.feeHeadId}>{item.feeHeadName}: {item.amount.toLocaleString('en-IN')}</li>))}</ul></div>
                                <div className="text-right mt-2"><a href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${payment.id}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm"><Printer className="mr-1 h-3 w-3" />Print</Button></a></div>
                            </div>
                        ))}
                    </div>
                ) : (<div className="text-center text-muted-foreground py-10">No payment history found for this student.</div>)}
            </CardContent>
        </Card>
    );
}

function FeeStatus({ studentFeeStatus }: { studentFeeStatus: any[] }) {
    const totalDue = studentFeeStatus.reduce((acc, item) => acc + item.due, 0);
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex justify-between items-center'><span>Fee Status</span><span className={cn('text-lg', totalDue > 0 ? 'text-destructive' : 'text-green-600')}>Total Dues: {totalDue.toLocaleString('en-IN', {style: 'currency', currency: 'INR'})}</span></CardTitle>
                <CardDescription>An overview of the student's fee dues for the current session.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-h-60 overflow-y-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>Fee Head</TableHead><TableHead className="text-right">Payable</TableHead><TableHead className="text-right">Paid</TableHead><TableHead className="text-right">Discount</TableHead><TableHead className="text-right">Due</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {studentFeeStatus.length > 0 ? studentFeeStatus.map(item => (
                                <TableRow key={item.feeHeadId}><TableCell className="font-medium">{item.feeHeadName}</TableCell><TableCell className="text-right">{item.totalPayable.toLocaleString('en-IN')}</TableCell><TableCell className="text-right">{item.totalPaid.toLocaleString('en-IN')}</TableCell><TableCell className="text-right text-green-600">{item.totalDiscount > 0 ? `-${item.totalDiscount.toLocaleString('en-IN')}` : '-'}</TableCell><TableCell className={cn("text-right font-semibold", item.due > 0 ? 'text-destructive' : 'text-green-600')}>{item.due.toLocaleString('en-IN')}</TableCell></TableRow>
                            )) : (<TableRow><TableCell colSpan={5} className="text-center h-24">No fee structure assigned to this student's class.</TableCell></TableRow>)}
                        </TableBody>
                         <tfoot className='bg-muted/50 font-bold'><TableRow><TableCell colSpan={4} className="text-right">Total Outstanding Dues</TableCell><TableCell className="text-right text-lg">{totalDue.toLocaleString('en-IN')}</TableCell></TableRow></tfoot>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

    