
'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Search, User, Wallet, History, Printer } from 'lucide-react';

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
import numberToWords from 'number-to-words';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentSearchResult = { id: string; studentName: string; };

const FeePaymentItemSchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0, "Amount must be positive"),
});

const FeeCollectionFormSchema = z.object({
    paymentDate: z.date(),
    paymentMode: z.enum(['Cash', 'Cheque', 'UPI', 'Card', 'Bank Transfer']),
    transactionId: z.string().optional(),
    paidFor: z.array(FeePaymentItemSchema).min(1, "At least one fee head must be selected."),
});

type FeeCollectionFormValues = z.infer<typeof FeeCollectionFormSchema>;


export function FeeManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    // Search state
    const [searchClassId, setSearchClassId] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
    const [isSearching, startSearchTransition] = useTransition();

    // Details state
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [feeStructure, setFeeStructure] = useState<any>(null);
    const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const searchClass = useMemo(() => classes.find(c => c.id === searchClassId), [classes, searchClassId]);

    const handleSearch = () => {
        if (!searchClassId || !searchSection) {
            alert("Please select both a class and a section.");
            return;
        }
        startSearchTransition(async () => {
            const students = await getStudentsForSchool({ schoolId, classId: searchClassId, section: searchSection, name: searchName });
            setSearchResults(students);
        });
    };

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentId(studentId);
        setIsLoadingDetails(true);
        getStudentFeeDetails(schoolId, studentId).then(result => {
            if(result.success && result.data){
                setStudentDetails(result.data.student);
                setFeeStructure(result.data.feeStructure);
                setPaymentHistory(result.data.paymentHistory);
            }
            setIsLoadingDetails(false);
        });
    };
    
    const handleClear = () => {
        setSearchClassId('');
        setSearchSection('');
        setSearchName('');
        setSearchResults([]);
        setSelectedStudentId(null);
        setStudentDetails(null);
    };

    return (
        <div className="space-y-6">
            {/* Student Search Section */}
            {!selectedStudentId && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Find Student</CardTitle>
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
                                    <TableHeader>
                                        <TableRow><TableHead>Student Name</TableHead><TableHead>Admission ID</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searchResults.map(s => (
                                            <TableRow key={s.id}>
                                                <TableCell>{s.studentName}</TableCell>
                                                <TableCell>{s.id}</TableCell>
                                                <TableCell className="text-right"><Button size="sm" onClick={() => handleSelectStudent(s.id)}>Select</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
           

            {isLoadingDetails ? (
                 <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : selectedStudentId && studentDetails && (
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Fee Details for {studentDetails.studentName}</h2>
                        <Button variant="outline" onClick={handleClear}>Search for another student</Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Fee Payment Form */}
                        <div className="lg:col-span-3">
                           <FeeCollectionForm student={studentDetails} feeStructure={feeStructure} schoolId={schoolId} onPaymentSuccess={() => handleSelectStudent(selectedStudentId)}/>
                        </div>
                        {/* Payment History */}
                        <div className="lg:col-span-2">
                            <PaymentHistory history={paymentHistory} schoolId={schoolId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


function FeeCollectionForm({ student, feeStructure, schoolId, onPaymentSuccess }: { student: any, feeStructure: any, schoolId: string, onPaymentSuccess: () => void }) {
    
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, reset } = useForm<FeeCollectionFormValues>({
        resolver: zodResolver(FeeCollectionFormSchema),
        defaultValues: {
            paymentDate: new Date(),
            paymentMode: "Cash",
            transactionId: '',
            paidFor: feeStructure?.structure.map((item: any) => ({ ...item, isPaid: false })) || [],
        },
    });

    const { fields } = useFieldArray({ control, name: "paidFor" });

    const [state, formAction] = useFormState(collectFee, { success: false });

    const watchPaidFor = watch('paidFor');
    const totalAmount = useMemo(() => {
        return watchPaidFor.reduce((acc, curr, index) => {
            const item = (fields[index] as any);
            return item.isPaid ? acc + Number(curr.amount || 0) : acc;
        }, 0);
    }, [watchPaidFor, fields]);
    
    useEffect(() => {
        if(state.success) {
            onPaymentSuccess();
            reset();
        }
    }, [state.success, onPaymentSuccess, reset]);

    const onFormSubmit = (data: FeeCollectionFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('studentId', student.id);
        formData.append('classId', student.classId);
        formData.append('paymentDate', data.paymentDate.toISOString());
        formData.append('paymentMode', data.paymentMode);
        formData.append('transactionId', data.transactionId || '');
        
        const paidItems = data.paidFor.filter((item, index) => (fields[index] as any).isPaid);
        if(paidItems.length === 0) {
            alert("Please select at least one fee item to pay.");
            return;
        }

        formData.append('paidFor', JSON.stringify(paidItems));
        formData.append('totalAmount', String(totalAmount));

        formAction(formData);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Wallet className="mr-2 h-5 w-5" /> New Fee Payment</CardTitle>
            </CardHeader>
            <CardContent>
                 {state.error && <Alert variant="destructive" className="mb-4"><AlertDescription>{state.error}</AlertDescription></Alert>}
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
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Fee Head</TableHead>
                                        <TableHead className="text-right">Amount Due</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <Controller
                                                    name={`paidFor.${index}.isPaid` as any}
                                                    control={control}
                                                    render={({ field: checkboxField }) => <Checkbox checked={checkboxField.value} onCheckedChange={checkboxField.onChange} />}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{watchPaidFor[index].feeHeadName}</TableCell>
                                            <TableCell className="text-right">
                                                <Controller
                                                    name={`paidFor.${index}.amount`}
                                                    control={control}
                                                    render={({ field: amountField }) => <Input type="number" {...amountField} className="h-8 w-28 ml-auto text-right" />}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {errors.paidFor && <p className="text-sm text-destructive">{errors.paidFor.message || errors.paidFor.root?.message}</p>}
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold">Payment Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Date</Label>
                                <Controller name="paymentDate" control={control} render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP') : 'Select Date'}</Button></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent>
                                    </Popover>
                                )} />
                            </div>
                             <div className="space-y-2">
                                <Label>Payment Mode</Label>
                                <Controller name="paymentMode" control={control} render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Cheque">Cheque</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Card">Card</SelectItem>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                        </div>
                        {watch('paymentMode') !== 'Cash' && (
                             <div className="space-y-2">
                                <Label>Transaction/Reference ID</Label>
                                <Input {...register('transactionId')} />
                            </div>
                        )}
                         <div className="text-right text-xl font-bold">
                            Total Amount: {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting || totalAmount === 0}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Collect Fee
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function PaymentHistory({ history, schoolId }: { history: any[], schoolId: string }) {
    return (
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5" /> Payment History</CardTitle>
            </CardHeader>
            <CardContent>
                {history.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {history.map(payment => (
                            <div key={payment.id} className="border p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-lg">{payment.totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                        <p className="text-xs text-muted-foreground">{payment.receiptNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{format(payment.paymentDate, 'dd-MMM-yyyy')}</p>
                                        <p className="text-xs text-muted-foreground">{payment.paymentMode}</p>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t">
                                     <p className="text-xs font-semibold mb-1">Paid For:</p>
                                     <ul className="text-xs text-muted-foreground list-disc list-inside">
                                        {payment.paidFor.map((item: any) => (
                                            <li key={item.feeHeadId}>{item.feeHeadName}: {item.amount.toLocaleString('en-IN')}</li>
                                        ))}
                                     </ul>
                                </div>
                                 <div className="text-right mt-2">
                                     <a href={`/director/dashboard/${schoolId}/admin/fees/receipt?id=${payment.id}`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm"><Printer className="mr-1 h-3 w-3" />Print</Button>
                                     </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        No payment history found for this student.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

    