
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

import { getStudentFeeDetails, collectFee } from '@/app/actions/finance';
import { getStudentsForSchool } from '@/app/actions/academics';
import { Loader2, Search, CalendarIcon, Wallet, FileText, Receipt, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentData = { id: string; studentName: string; className: string; section: string; };

const FeePaymentItemSchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0),
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


export function FeeManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [name, setName] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [classId, setClassId] = useState('');
    
    const [searchedStudents, setSearchedStudents] = useState<any[]>([]);
    const [loadingSearch, startSearchTransition] = useTransition();

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [details, setDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleSearch = () => {
        startSearchTransition(async () => {
            const studentData = await getStudentsForSchool({ schoolId, name, admissionId, classId });
            setSearchedStudents(studentData);
            setSelectedStudent(null);
            setDetails(null);
        });
    }

    const handleSelectStudent = useCallback(async (student: StudentData) => {
        setSelectedStudent(student);
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
                    key={selectedStudent.id}
                    student={selectedStudent} 
                    details={details}
                    schoolId={schoolId}
                    onPaymentSuccess={() => handleSelectStudent(selectedStudent)}
                />
            ) : selectedStudent ? (
                 <p className="text-center text-muted-foreground py-8 border rounded-lg">Could not load fee details for the selected student.</p>
            ): (
                 <p className="text-center text-muted-foreground py-8 border rounded-lg">Search for and select a student to view their fee details.</p>
            )}
        </div>
    )
}


function FeeDetailsDisplay({ student, details, schoolId, onPaymentSuccess }: { student: any, details: any, schoolId: string, onPaymentSuccess: () => void }) {
    const { feeStatus, paymentHistory } = details;
    const totalDue = feeStatus.reduce((acc: number, item: any) => acc + item.due, 0);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><FileText className="h-6 w-6"/> Fee Status for {student.studentName}</CardTitle>
                    <CardDescription>Total Outstanding Balance: <span className='font-bold text-lg text-primary'>{totalDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Fee Head</TableHead><TableHead>Total Payable</TableHead><TableHead>Paid</TableHead><TableHead>Discount</TableHead><TableHead>Due</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {feeStatus.map((item: any) => (
                                <TableRow key={item.feeHeadId}>
                                    <TableCell className="font-medium">{item.feeHeadName}</TableCell>
                                    <TableCell>{item.totalPayable.toLocaleString('en-IN')}</TableCell>
                                    <TableCell>{item.totalPaid.toLocaleString('en-IN')}</TableCell>
                                    <TableCell>{item.totalDiscount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="font-semibold">{item.due.toLocaleString('en-IN')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                 <FeeCollectionForm student={student} feeStatus={feeStatus} schoolId={schoolId} onPaymentSuccess={onPaymentSuccess}/>
                 <PaymentHistory history={paymentHistory} schoolId={schoolId} />
            </div>
        </div>
    );
}

function FeeCollectionForm({ student, feeStatus, schoolId, onPaymentSuccess }: { student: any, feeStatus: any[], schoolId: string, onPaymentSuccess: () => void }) {
    const { control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FeeCollectionFormValues>({
        resolver: zodResolver(FeeCollectionFormSchema),
        defaultValues: { paymentDate: new Date(), paymentMode: 'Cash', paidFor: [], discount: 0, fine: 0 }
    });
    
    const [state, formAction] = useFormState(collectFee, { success: false, error: null, message: null, receiptId: null });

    useEffect(() => {
        const defaultPaidFor = feeStatus.filter(item => item.due > 0).map(item => ({
            feeHeadId: item.feeHeadId,
            feeHeadName: item.feeHeadName,
            amount: item.due,
        }));
        setValue('paidFor', defaultPaidFor);
    }, [feeStatus, setValue]);
    
    useEffect(() => {
        if(state.success) {
            onPaymentSuccess();
            reset({ paymentDate: new Date(), paymentMode: 'Cash', paidFor: [], discount: 0, fine: 0 });
        }
    }, [state.success, onPaymentSuccess, reset]);

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
                                    <Link href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${state.receiptId}`} target="_blank">
                                        <Button variant="link" className="p-0 h-auto ml-2">Print Receipt</Button>
                                    </Link>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className='border rounded-md p-4 space-y-3 max-h-60 overflow-y-auto'>
                        <h4 className='text-sm font-medium'>Select Fee Items to Pay</h4>
                        {feeStatus.map(item => (
                            item.due > 0 &&
                            <div key={item.feeHeadId} className="flex items-center gap-4">
                               <Controller
                                    name="paidFor"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            checked={field.value?.some(v => v.feeHeadId === item.feeHeadId)}
                                            onCheckedChange={(checked) => {
                                                const currentItems = field.value || [];
                                                if (checked) {
                                                    field.onChange([...currentItems, { feeHeadId: item.feeHeadId, feeHeadName: item.feeHeadName, amount: item.due }]);
                                                } else {
                                                    field.onChange(currentItems.filter(v => v.feeHeadId !== item.feeHeadId));
                                                }
                                            }}
                                        />
                                    )}
                                />
                                <Label className="flex-grow font-medium">{item.feeHeadName}</Label>
                                <Input 
                                    type="number" 
                                    className="w-32" 
                                    value={watchedPaidFor.find(v => v.feeHeadId === item.feeHeadId)?.amount || ''}
                                    onChange={(e) => {
                                        const newValue = Number(e.target.value);
                                        const newPaidFor = watchedPaidFor.map(v => v.feeHeadId === item.feeHeadId ? { ...v, amount: newValue } : v);
                                        setValue('paidFor', newPaidFor, { shouldValidate: true });
                                    }}
                                    disabled={!watchedPaidFor.some(v => v.feeHeadId === item.feeHeadId)}
                                />
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

    