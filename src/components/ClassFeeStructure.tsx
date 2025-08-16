
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveFeeStructure, getFeeStructure } from '@/app/actions/finance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Save } from 'lucide-react';

type ClassData = { id: string; name: string; sections: string[]; };
type FeeHead = { id: string; name: string; description?: string; type: "One-time" | "Annual" | "Monthly" | "Quarterly"; };

const FeeStructureEntrySchema = z.object({
  feeHeadId: z.string(),
  feeHeadName: z.string(),
  amount: z.coerce.number().min(0),
});

const FeeStructureFormSchema = z.object({
  structure: z.array(FeeStructureEntrySchema),
});

type FeeStructureFormValues = z.infer<typeof FeeStructureFormSchema>;

interface ClassFeeStructureProps {
    schoolId: string;
    allClasses: ClassData[];
    feeHeads: FeeHead[];
}

export function ClassFeeStructure({ schoolId, allClasses, feeHeads }: ClassFeeStructureProps) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, reset, formState: { isSubmitting }, register } = useForm<FeeStructureFormValues>({
        resolver: zodResolver(FeeStructureFormSchema),
        defaultValues: { structure: [] },
    });

    const { fields } = useFieldArray({ control, name: 'structure' });
    
    const [state, formAction] = useFormState(saveFeeStructure, { success: false, error: null });

    useEffect(() => {
        const fetchStructure = async () => {
            if (!selectedClassId || feeHeads.length === 0) {
                reset({ structure: [] });
                return;
            }
            setLoading(true);
            const result = await getFeeStructure(schoolId, selectedClassId);
            
            let classStructure: any[] = [];
            if (result.success && result.data) {
                classStructure = result.data.structure;
            }
            
            // Map all available fee heads and populate with existing data if available
            const newStructure = feeHeads.map(head => {
                const existingEntry = classStructure.find(entry => entry.feeHeadId === head.id);
                return {
                    feeHeadId: head.id,
                    feeHeadName: head.name,
                    amount: existingEntry ? existingEntry.amount : 0,
                };
            });
            reset({ structure: newStructure });
            setLoading(false);
        };
        fetchStructure();
    }, [selectedClassId, feeHeads, schoolId, reset]);
    
    const onFormSubmit = (data: FeeStructureFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('classId', selectedClassId);
        formData.append('structure', JSON.stringify(data.structure));
        formAction(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Class Fee Structures</CardTitle>
                <CardDescription>Select a class to define its fee structure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-w-xs space-y-2">
                    <Label>Select Class</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                        <SelectContent>{allClasses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : selectedClassId ? (
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                         {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fee Head</TableHead>
                                        <TableHead className="w-[200px]">Amount (INR)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.length > 0 ? fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell className="font-medium">{field.feeHeadName}</TableCell>
                                            <TableCell>
                                                <Input type="number" {...register(`structure.${index}.amount`)} />
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={2} className="h-24 text-center">
                                                No fee heads have been created yet. Please add them in the "Manage Fee Heads" tab.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {fields.length > 0 && (
                            <div className="flex justify-end mt-4">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4"/>
                                    Save Structure
                                </Button>
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="text-center text-muted-foreground h-48 flex items-center justify-center border rounded-lg">
                        <p>Please select a class to begin.</p>
                    </div>
                )}
                 {state.message && state.success && <p className="text-sm text-green-600 mt-2 text-right">{state.message}</p>}
            </CardContent>
        </Card>
    );
}
