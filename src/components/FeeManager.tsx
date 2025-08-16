
'use client';

import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useForm, useFormState, Controller } from 'react-hook-form';
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
import { Loader2, Search, CalendarIcon, Wallet, FileText, Receipt, Printer, X, PlusCircle } from 'lucide-react';
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


export function FeeManager({ schoolId, classes, initialStudents }: { schoolId: string, classes: ClassData[], initialStudents: any[] }) {
    const [students, setStudents] = useState(initialStudents);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [details, setDetails] = useState<any>(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const fetchDetails = useCallback(async (studentId: string) => {
        setLoadingDetails(true);
        const res = await getStudentFeeDetails(schoolId, studentId);
        if (res.success) {
            setDetails(res.data);
        } else {
            setDetails(null);
            alert(`Error: ${res.error}`);
        }
        setLoadingDetails(false);
    }, [schoolId]);

    const handlePaymentSuccess = () => {
        if (selectedStudent) {
            fetchDetails(selectedStudent.id);
        }
    };
    
    return (
        <div className="space-y-6">
            <StudentSearch 
                classes={classes}
                onSelectStudent={(student) => {
                    setSelectedStudent(student);
                    fetchDetails(student.id);
                }}
            />
            {loadingDetails ? (
                <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
            ) : selectedStudent && details ? (
                <FeeDetailsDisplay 
                    key={selectedStudent.id}
                    student={selectedStudent} 
                    details={details}
                    schoolId={schoolId}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            ) : selectedStudent ? (
                 <p className="text-center text-muted-foreground py-8 border rounded-lg">Could not load fee details for the selected student.</p>
            ): (
                 <p className="text-center text-muted-foreground py-8 border rounded-lg">Search for and select a student to view their fee details.</p>
            )}
        </div>
    )
}

function StudentSearch({ classes, onSelectStudent }: { classes: ClassData[], onSelectStudent: (student: any) => void }) {
    const [name, setName] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [classId, setClassId] = useState('');
    const [loading, startTransition] = useTransition();
    const [students, setStudents] = useState<any[]>([]);

    const handleSearch = () => {
        startTransition(async () => {
            const { getStudentsForSchool } = await import('@/app/actions/academics');
            const result = await getStudentsForSchool({ schoolId: '', name, admissionId, classId });
            setStudents(result);
        });
    }
    
    return (
        <Card>
            <CardHeader><CardTitle>Find Student</CardTitle></CardHeader>
            <CardContent>
                <div className='flex gap-4 items-end'>
                    <Input placeholder="Search by Name" value={name} onChange={e => setName(e.target.value)} />
                    <Input placeholder="Search by Admission ID" value={admissionId} onChange={e => setAdmissionId(e.target.value)} />
                    <Combobox options={classes.map(c => ({label: c.name, value: c.id}))} value={classId} onChange={setClassId} placeholder="Filter by class..." />
                    <Button onClick={handleSearch} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>} Search</Button>
                </div>
                 {students.length > 0 && (
                    <div className="mt-4 border rounded-lg max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Admission ID</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.id}</TableCell>
                                        <TableCell>{s.studentName}</TableCell>
                                        <TableCell>{s.className} - {s.section}</TableCell>
                                        <TableCell><Button size="sm" onClick={() => onSelectStudent(s)}>Select</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}

function FeeDetailsDisplay({ student, details, schoolId, onPaymentSuccess }: { student: any, details: any, schoolId: string, onPaymentSuccess: () => void }) {
    const { feeStatus, paymentHistory } = details;
    const totalDue = feeStatus.reduce((acc: number, item: any) => acc + item.due, 0);

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><FileText className="h-6 w-6"/> Fee Status</CardTitle>
                    <CardDescription>Outstanding dues for {student.studentName}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fee Head</TableHead>
                                <TableHead>Total Payable</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Due</TableHead>
                            </TableRow>
                        </TableHeader>
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
                        <TableRow className="font-bold bg-muted">
                            <TableCell colSpan={4} className="text-right">Total Outstanding Dues</TableCell>
                            <TableCell className="text-lg">
                                {totalDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </TableCell>
                        </TableRow>
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
    
    const [state, formAction] = useFormState(collectFee, { success: false });

    useEffect(() => {
        // This effect will run when the feeStatus changes (i.e. a new student is selected)
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
            reset();
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

                    <div className='border rounded-md p-4 space-y-3'>
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
                                    value={watchedPaidFor.find(v => v.feeHeadId === item.feeHeadId)?.amount || 0}
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

    