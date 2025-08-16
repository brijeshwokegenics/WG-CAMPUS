'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Loader2, PlusCircle, Save, Trash2, Wallet } from 'lucide-react';

import { getUsersForSchool } from '@/app/actions/users';
import { setStaffSalary, getStaffSalaries } from '@/app/actions/hr';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';


const AllowanceSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().min(0),
});

const DeductionSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().min(0),
});

const SalarySchema = z.object({
  schoolId: z.string().min(1),
  userId: z.string().min(1),
  basicSalary: z.coerce.number().min(0, "Basic salary must be a positive number."),
  allowances: z.array(AllowanceSchema).optional(),
  deductions: z.array(DeductionSchema).optional(),
});


type User = { id: string; name: string; userId: string; email: string | null };
type SalaryData = z.infer<typeof SalarySchema>;

export function StaffSalaryManager({ schoolId }: { schoolId: string }) {
    const [staff, setStaff] = useState<User[]>([]);
    const [salaries, setSalaries] = useState<Record<string, SalaryData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [usersRes, salariesRes] = await Promise.all([
                getUsersForSchool(schoolId),
                getStaffSalaries(schoolId)
            ]);
            
            if (usersRes.success && usersRes.data) {
                setStaff(usersRes.data as User[]);
            }
            if (salariesRes.success && salariesRes.data) {
                const salariesMap: Record<string, SalaryData> = {};
                (salariesRes.data as SalaryData[]).forEach(s => {
                    salariesMap[s.userId] = s;
                });
                setSalaries(salariesMap);
            }
            setLoading(false);
        }
        fetchData();
    }, [schoolId]);
    
    const handleSuccess = (userId: string, newSalaryData: SalaryData) => {
        setSalaries(prev => ({...prev, [userId]: newSalaryData}));
    }

    if (loading) {
        return <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;
    }

    return (
        <div className="space-y-4">
            {staff.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {staff.map(user => (
                        <SalaryFormAccordionItem 
                            key={user.id} 
                            user={user} 
                            schoolId={schoolId} 
                            initialSalary={salaries[user.id]}
                            onSuccess={handleSuccess}
                        />
                    ))}
                </Accordion>
            ) : (
                <p className='text-center text-muted-foreground py-8'>No staff found. Please add users in User Management.</p>
            )}
        </div>
    );
}


function SalaryFormAccordionItem({ user, schoolId, initialSalary, onSuccess }: { user: User, schoolId: string, initialSalary?: SalaryData, onSuccess: (userId: string, data: SalaryData) => void}) {
    
    const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SalaryData>({
        resolver: zodResolver(SalarySchema),
        defaultValues: initialSalary || {
            schoolId: schoolId,
            userId: user.id,
            basicSalary: 0,
            allowances: [],
            deductions: [],
        },
    });
    
    const { fields: allowanceFields, append: appendAllowance, remove: removeAllowance } = useFieldArray({ control, name: "allowances" });
    const { fields: deductionFields, append: appendDeduction, remove: removeDeduction } = useFieldArray({ control, name: "deductions" });
    
    const [state, formAction] = useFormState(setStaffSalary, { success: false });

    const watchAllowances = watch('allowances');
    const watchDeductions = watch('deductions');
    const watchBasicSalary = watch('basicSalary');
    
    const { grossSalary, netSalary, totalAllowances, totalDeductions } = useMemo(() => {
        const basic = Number(watchBasicSalary) || 0;
        const allowances = watchAllowances?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
        const deductions = watchDeductions?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
        const gross = basic + allowances;
        const net = gross - deductions;
        return { grossSalary: gross, netSalary: net, totalAllowances: allowances, totalDeductions: deductions };
    }, [watchBasicSalary, watchAllowances, watchDeductions]);
    
    useEffect(() => {
        if(state.success) {
            // Refetch or update state
        }
    }, [state.success]);

    const onFormSubmit = (data: SalaryData) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('userId', user.id);
        formData.append('basicSalary', String(data.basicSalary));
        formData.append('allowances', JSON.stringify(data.allowances || []));
        formData.append('deductions', JSON.stringify(data.deductions || []));
        formAction(formData);
        onSuccess(user.id, data);
    }
    
    return (
        <AccordionItem value={user.id}>
            <AccordionTrigger>
                <div className='flex justify-between w-full pr-4'>
                    <span className='font-medium'>{user.name} <span className='text-muted-foreground text-sm'>({user.userId})</span></span>
                    <span className='text-primary font-semibold'>Net Salary: {netSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <form onSubmit={handleSubmit(onFormSubmit)} className="p-4 bg-muted/50 rounded-b-md">
                     {state.message && (
                        <Alert className={cn(state.success ? "border-green-500 text-green-700" : "border-destructive text-destructive", "mb-4")}>
                        <AlertTitle>{state.success ? 'Success!' : 'Error!'}</AlertTitle>
                        <AlertDescription>{state.message || state.error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Basic Salary */}
                        <div className='space-y-2 lg:col-span-1'>
                           <Label htmlFor={`basic-${user.id}`} className='text-base font-semibold'>Basic Salary</Label>
                           <Input id={`basic-${user.id}`} type="number" {...register('basicSalary')} />
                           {errors.basicSalary && <p className="text-sm text-destructive">{errors.basicSalary.message}</p>}
                        </div>

                        {/* Allowances */}
                        <div className="space-y-4 lg:col-span-1">
                            <h4 className='text-base font-semibold'>Allowances</h4>
                             {allowanceFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end">
                                    <Input {...register(`allowances.${index}.name`)} placeholder="Allowance Name" className="text-xs h-9"/>
                                    <Input type="number" {...register(`allowances.${index}.amount`)} placeholder="Amount" className="text-xs h-9" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAllowance(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendAllowance({ name: '', amount: 0 })}>
                                <PlusCircle className='h-4 w-4 mr-2' /> Add Allowance
                            </Button>
                        </div>
                        
                        {/* Deductions */}
                        <div className="space-y-4 lg:col-span-1">
                            <h4 className='text-base font-semibold'>Deductions</h4>
                            {deductionFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-end">
                                    <Input {...register(`deductions.${index}.name`)} placeholder="Deduction Name" className="text-xs h-9" />
                                    <Input type="number" {...register(`deductions.${index}.amount`)} placeholder="Amount" className="text-xs h-9" />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDeduction(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendDeduction({ name: '', amount: 0 })}>
                                <PlusCircle className='h-4 w-4 mr-2' /> Add Deduction
                            </Button>
                        </div>

                        {/* Summary */}
                        <div className="space-y-2 bg-background p-4 rounded-lg border lg:col-span-1">
                            <h4 className="text-base font-semibold mb-3 text-center">Salary Summary</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Basic Salary:</span>
                                <span>{watchBasicSalary.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Allowances:</span>
                                <span>+ {totalAllowances.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="flex justify-between text-sm font-medium border-t pt-1">
                                <span className="text-muted-foreground">Gross Salary:</span>
                                <span>{grossSalary.toLocaleString('en-IN')}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Deductions:</span>
                                <span>- {totalDeductions.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-primary border-t pt-2 mt-2">
                                <span>Net Salary:</span>
                                <span>{netSalary.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end mt-6">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className='h-4 w-4 mr-2' /> Save Salary for {user.name}
                        </Button>
                    </div>
                </form>
            </AccordionContent>
        </AccordionItem>
    )
}
