
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useFormState } from 'react-dom';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { updateExamSchedule, getExamSchedule } from '@/app/actions/academics';

type ClassData = { id: string; name: string; sections: string[]; };
type ExamTerm = { id: string; name: string; session: string; };

const SubjectScheduleSchema = z.object({
  subjectName: z.string().min(1, "Subject name is required."),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  maxMarks: z.coerce.number().min(1, "Max marks must be at least 1."),
});

const ExamScheduleFormSchema = z.object({
    subjects: z.array(SubjectScheduleSchema),
});

type ExamScheduleFormValues = z.infer<typeof ExamScheduleFormSchema>;

interface ExamScheduleDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    examTerm: ExamTerm;
    schoolId: string;
    classes: ClassData[];
}

export function ExamScheduleDialog({ isOpen, setIsOpen, examTerm, schoolId, classes }: ExamScheduleDialogProps) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(false);
    
    const initialState = { success: false, error: null, message: null };
    const [state, formAction] = useFormState(updateExamSchedule, initialState);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ExamScheduleFormValues>({
        resolver: zodResolver(ExamScheduleFormSchema),
        defaultValues: {
            subjects: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'subjects',
    });
    
    useEffect(() => {
        async function fetchSchedule() {
            if (selectedClassId) {
                setLoading(true);
                const result = await getExamSchedule(schoolId, examTerm.id, selectedClassId);
                if (result.success && result.data) {
                    reset({ subjects: result.data.subjects });
                } else {
                    reset({ subjects: [] });
                }
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [selectedClassId, examTerm.id, schoolId, reset]);

    const onFormSubmit = (data: ExamScheduleFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('examTermId', examTerm.id);
        formData.append('classId', selectedClassId);
        formData.append('subjects', JSON.stringify(data.subjects));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[60%]">
                <DialogHeader>
                    <DialogTitle>Manage Exam Schedule: {examTerm.name}</DialogTitle>
                    <DialogDescription>
                        Set the schedule for each subject for a selected class.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Class</Label>
                        <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>

                    {loading ? (
                        <div className="text-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : selectedClassId && (
                        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-5 gap-4 items-end border-b pb-4">
                                    <div className="space-y-2">
                                        <Label>Subject Name</Label>
                                        <Input {...register(`subjects.${index}.subjectName`)} />
                                        {errors.subjects?.[index]?.subjectName && <p className="text-xs text-destructive">{errors.subjects?.[index]?.subjectName?.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Controller
                                            name={`subjects.${index}.date`}
                                            control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {value ? format(value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={value} onSelect={onChange} initialFocus /></PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Start Time</Label>
                                        <Input type="time" {...register(`subjects.${index}.startTime`)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Time</Label>
                                        <Input type="time" {...register(`subjects.${index}.endTime`)} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Max Marks</Label>
                                        <Input type="number" {...register(`subjects.${index}.maxMarks`)} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={() => append({ subjectName: '', date: new Date(), startTime: '', endTime: '', maxMarks: 100 })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                            </Button>
                            <div className="flex justify-end">
                                <Button type="submit">Save Schedule</Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
