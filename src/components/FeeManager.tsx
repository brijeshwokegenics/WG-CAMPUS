
'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


import { getStudentFeeDetails, collectFee } from '@/app/actions/finance';
import { getStudentsForSchool, getClassesForSchool } from '@/app/actions/academics';
import { Loader2, Search, CalendarIcon, Wallet, FileText, Receipt, Printer, Mail, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentData = { id: string; studentName: string; className: string; section: string; };

const FeePaymentItemSchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0),
  installmentName: z.string().optional(),
});

const FeeCollectionFormSchema = z.object({
    paymentDate: z.date(),
    paymentMode: z.enum(['Cash', 'Cheque', 'UPI', 'Card', 'Bank Transfer']),
    transactionId: z.string().optional(),
    paidFor: z.array(FeePaymentItemSchema).min(1, 'Please select at least one fee item to pay.'),
    discount: z.coerce.number().min(0).optional(),
    fine: z.coerce.number().min(0).optional(),
});
type FeeCollectionFormValues = z.infer<typeof FeeCollectionFormSchema>;


export function FeeManager({ schoolId }: { schoolId: string }) {
    const [name, setName] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [classId, setClassId] = useState('');
    const [classes, setClasses] = useState<ClassData[]>([]);
    
    const [searchedStudents, setSearchedStudents] = useState<any[]>([]);
    const [loadingSearch, startSearchTransition] = useTransition();

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [details, setDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        async function fetchInitialData() {
            const classRes = await getClassesForSchool(schoolId);
            if (classRes.success) setClasses(classRes.data || []);
        }
        fetchInitialData();
    }, [schoolId]);

    const handleSearch = () => {
        startSearchTransition(async () => {
            const studentData = await getStudentsForSchool({ schoolId, searchTerm: name, admissionId, classId });
            setSearchedStudents(studentData);
            setSelectedStudent(null);
            setDetails(null);
        });
    }

    const fetchStudentDetails = useCallback(async (student: StudentData) => {
        setLoadingDetails(true);
        const res = await getStudentFeeDetails(schoolId, student.id);
        if (res.success) {
            setDetails(res.data);
        } else {
            setDetails(null);
            alert(`Error: ${res.error}`);
        }
        setLoadingDetails(false);
    }, [schoolId]);


    const handleSelectStudent = useCallback((student: StudentData) => {
        setSelectedStudent(student);
        fetchStudentDetails(student);
    }, [fetchStudentDetails]);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Find Student</CardTitle>
                    <CardDescription>Search for a student by name, admission ID, or class to manage their fees.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col md:flex-row gap-4 items-end'>
                        <div className='flex-grow w-full'><Label>Name</Label><Input placeholder="Search by Name" value={name} onChange={e => setName(e.target.value)} /></div>
                        <div className='flex-grow w-full'><Label>Admission ID</Label><Input placeholder="Search by Admission ID" value={admissionId} onChange={e => setAdmissionId(e.target.value)} /></div>
                        <div className='flex-grow w-full'><Label>Class</Label><Combobox options={classes.map(c => ({label: c.name, value: c.id}))} value={classId} onChange={setClassId} placeholder="Filter by class..." /></div>
                        <Button onClick={handleSearch} disabled={loadingSearch} className='w-full md:w-auto'>{loadingSearch ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>} Search</Button>
                    </div>
                    {searchedStudents.length > 0 && (
                        <div className="mt-4 border rounded-lg max-h-60 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Admission ID</TableHead><TableHead>Student Name</TableHead><TableHead>Class</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {searchedStudents.map(s => (
                                        <TableRow key={s.id} className={cn(selectedStudent?.id === s.id && 'bg-muted/50')}>
                                            <TableCell>{s.id}</TableCell>
                                            <TableCell>{s.studentName}</TableCell>
                                            <TableCell>{s.className} - {s.section}</TableCell>
                                            <TableCell><Button size="sm" onClick={() => handleSelectStudent(s)}>Select</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {loadingDetails ? (
                <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
            ) : selectedStudent && details ? (
                <FeeDetailsDisplay 
                    key={selectedStudent.id} // Add key to force re-mount on student change
                    student={selectedStudent} 
                    details={details}
                    schoolId={schoolId}
                    onPaymentSuccess={() => fetchStudentDetails(selectedStudent)}
                />
            ) : selectedStudent ? (
                 <p className="text-center text-muted-foreground py-8 border rounded-lg">Could not load fee details for the selected student.</p>
            ): (
                 <p className="text-center text-muted-foreground py-8 border rounded-lg">Search for and select a student to view their fee details.</p>
            )}
        </div>
    )
}

// Parent component that holds state for the form action
function FeeDetailsDisplay({ student, details, schoolId, onPaymentSuccess }: { student: any, details: any, schoolId: string, onPaymentSuccess: () => void }) {
    const { feeStatus, paymentHistory } = details;
    const totalDue = feeStatus.reduce((acc: number, item: any) => acc + item.totalDue, 0);

    const initialState = { success: false, error: null, message: null, receiptId: null };
    const [state, formAction] = useFormState(collectFee, initialState);
    
    useEffect(() => {
        if (state.success) {
            onPaymentSuccess();
        }
    }, [state.success, onPaymentSuccess]);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><FileText className="h-6 w-6"/> Fee Status for {student.studentName}</CardTitle>
                    <CardDescription>Total Outstanding Balance: <span className='font-bold text-lg text-primary'>{totalDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        {feeStatus.map((item: any) => (
                             <AccordionItem value={item.feeHeadId} key={item.feeHeadId}>
                                <AccordionTrigger>
                                    <div className='flex justify-between w-full pr-4'>
                                        <span className='font-medium'>{item.feeHeadName}</span>
                                        <span className={cn('font-semibold', item.totalDue > 0 ? 'text-destructive' : 'text-green-600')}>
                                            Due: {item.totalDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Installment</TableHead><TableHead>Payable</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                        {item.installments.map((inst: any) => (
                                            <TableRow key={inst.name}>
                                                <TableCell>{inst.name}</TableCell>
                                                <TableCell>{inst.payable.toLocaleString('en-IN')}</TableCell>
                                                <TableCell>{inst.paid.toLocaleString('en-IN')}</TableCell>
                                                <TableCell className='font-semibold'>{inst.due.toLocaleString('en-IN')}</TableCell>
                                                <TableCell>
                                                     <span className={`px-2 py-1 text-xs rounded-full ${inst.status === 'Paid' ? 'bg-green-100 text-green-800' : inst.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        {inst.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                 <FeeCollectionForm student={student} feeStatus={feeStatus} schoolId={schoolId} state={state} formAction={formAction} />
                 <PaymentHistory history={paymentHistory} schoolId={schoolId} />
            </div>
        </div>
    );
}

function FeeCollectionForm({ student, feeStatus, schoolId, state, formAction }: { student: any, feeStatus: any[], schoolId: string, state: any, formAction: any }) {
    const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<FeeCollectionFormValues>({
        resolver: zodResolver(FeeCollectionFormSchema),
        defaultValues: { paymentDate: new Date(), paymentMode: 'Cash', paidFor: [], discount: 0, fine: 0 }
    });
    
    // This effect will run once when the component mounts with new feeStatus
    useEffect(() => {
        const defaultPaidFor = feeStatus.flatMap((head: any) => 
            head.installments
                .filter((inst: any) => inst.due > 0)
                .map((inst: any) => ({
                    feeHeadId: head.feeHeadId,
                    feeHeadName: head.feeHeadName,
                    installmentName: inst.name,
                    amount: inst.due,
                }))
        ).slice(0, 1); // Default to selecting just the first due installment
        setValue('paidFor', defaultPaidFor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [feeStatus, setValue]);
    
    useEffect(() => {
        if(state.success) {
            reset({ paymentDate: new Date(), paymentMode: 'Cash', paidFor: [], discount: 0, fine: 0 });
        }
    }, [state.success, reset]);

    const watchedPaidFor = watch('paidFor');
    const watchedDiscount = watch('discount') || 0;
    const watchedFine = watch('fine') || 0;
    
    const subTotal = useMemo(() => watchedPaidFor.reduce((acc, item) => acc + (Number(item.amount) || 0), 0), [watchedPaidFor]);
    const totalAmount = subTotal + watchedFine - watchedDiscount;

    const onFormSubmit = (data: FeeCollectionFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('studentId', student.id);
        formData.append('classId', student.classId);
        formData.append('totalAmount', String(totalAmount));

        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof Date) formData.append(key, value.toISOString());
            else if (key === 'paidFor') formData.append(key, JSON.stringify(value));
            else if (value !== undefined && value !== null) formData.append(key, String(value));
        });
        formAction(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Wallet className="h-6 w-6"/> New Fee Payment</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {state.message && (
                        <Alert className={cn(state.success ? "border-green-500 text-green-700" : "border-destructive text-destructive")}>
                            <AlertTitle>{state.success ? 'Success!' : 'Error!'}</AlertTitle>
                            <AlertDescription>
                                {state.message || state.error}
                                {state.success && state.receiptId && (
                                    <div className='flex gap-2 mt-2'>
                                         <Link href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${state.receiptId}`} target="_blank">
                                            <Button variant="link" className="p-0 h-auto"><Printer className='mr-1 h-4 w-4' /> Print Receipt</Button>
                                        </Link>
                                        <Button variant="link" disabled className="p-0 h-auto"><Mail className='mr-1 h-4 w-4' /> Email Receipt</Button>
                                        <Button variant="link" disabled className="p-0 h-auto"><MessageSquare className='mr-1 h-4 w-4' /> SMS Receipt</Button>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='border rounded-md p-4 space-y-3 max-h-60 overflow-y-auto'>
                        <h4 className='text-sm font-medium'>Select Fee Items to Pay</h4>
                        {feeStatus.map((head: any) => (
                            <div key={head.feeHeadId}>
                                <h5 className='font-semibold text-xs uppercase text-muted-foreground'>{head.feeHeadName}</h5>
                                {head.installments.map((item: any) => (
                                    item.due > 0 &&
                                    <div key={item.name} className="flex items-center gap-4 pl-2 py-1">
                                        <Controller
                                            name="paidFor"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={field.value?.some(v => v.installmentName === item.name && v.feeHeadId === head.feeHeadId)}
                                                    onCheckedChange={(checked) => {
                                                        const currentItems = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...currentItems, { feeHeadId: head.feeHeadId, feeHeadName: head.feeHeadName, installmentName: item.name, amount: item.due }]);
                                                        } else {
                                                            field.onChange(currentItems.filter(v => !(v.installmentName === item.name && v.feeHeadId === head.feeHeadId)));
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label className="flex-grow font-medium">{item.name} <span className="text-muted-foreground text-xs">(Due: {item.due})</span></Label>
                                        <Input 
                                            type="number" 
                                            className="w-32" 
                                            value={watchedPaidFor.find(v => v.installmentName === item.name && v.feeHeadId === head.feeHeadId)?.amount || ''}
                                            onChange={(e) => {
                                                const newValue = Number(e.target.value);
                                                const newPaidFor = watchedPaidFor.map(v => (v.installmentName === item.name && v.feeHeadId === head.feeHeadId) ? { ...v, amount: newValue } : v);
                                                setValue('paidFor', newPaidFor, { shouldValidate: true });
                                            }}
                                            disabled={!watchedPaidFor.some(v => v.installmentName === item.name && v.feeHeadId === head.feeHeadId)}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                         {errors.paidFor && <p className="text-sm text-destructive">{errors.paidFor.message}</p>}
                    </div>
                   
                    <div className='grid grid-cols-2 gap-4'>
                        <div className="space-y-2"><Label>Discount</Label><Input type="number" {...control.register('discount')} /></div>
                        <div className="space-y-2"><Label>Fine</Label><Input type="number" {...control.register('fine')} /></div>
                    </div>

                     <div className="p-4 bg-muted rounded-lg text-right">
                        <p>Subtotal: {subTotal.toLocaleString('en-IN')}</p>
                        <p className="text-lg font-bold">Total Payable: {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                         <div className="space-y-2">
                            <Label>Payment Date</Label>
                            <Controller name="paymentDate" control={control} render={({ field }) => (
                                <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                            )} />
                        </div>
                        <div className="space-y-2">
                             <Label>Payment Mode</Label>
                             <Controller name="paymentMode" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Cash">Cash</SelectItem><SelectItem value="Cheque">Cheque</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="Card">Card</SelectItem><SelectItem value="Bank Transfer">Bank Transfer</SelectItem></SelectContent></Select>
                             )} />
                        </div>
                    </div>
                     <div className="space-y-2"><Label>Transaction ID (Optional)</Label><Input {...control.register('transactionId')} /></div>

                     <Button type="submit" className="w-full" disabled={isSubmitting || totalAmount <= 0}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Collect Fee
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}


function PaymentHistory({ history, schoolId }: { history: any[], schoolId: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'><Receipt className="h-6 w-6"/> Payment History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
                    {history.length > 0 ? history.map(item => (
                        <div key={item.id} className="border p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-primary">{item.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                <p className="text-sm text-muted-foreground">Receipt: {item.receiptNumber}</p>
                                <p className="text-xs">{format(item.paymentDate, 'dd-MMM-yyyy')} via {item.paymentMode}</p>
                            </div>
                            <Link href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${item.id}`} target="_blank">
                                <Button variant="outline" size="sm"><Printer className="mr-2 h-4 w-4"/> Print</Button>
                            </Link>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center py-8">No payment history found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

    