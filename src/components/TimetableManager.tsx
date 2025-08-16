
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveTimetable, getTimetable } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Edit, Save, Printer } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type ClassData = { id: string; name: string; sections: string[]; };

const PeriodSchema = z.object({
  subject: z.string().optional(),
  teacher: z.string().optional(),
});

const TimetableFormSchema = z.object({
  monday: z.array(PeriodSchema),
  tuesday: z.array(PeriodSchema),
  wednesday: z.array(PeriodSchema),
  thursday: z.array(PeriodSchema),
  friday: z.array(PeriodSchema),
  saturday: z.array(PeriodSchema),
});

type TimetableFormValues = z.infer<typeof TimetableFormSchema>;

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const periods = Array.from({ length: 8 }, (_, i) => `Period ${i + 1}`);

const generateEmptyTimetable = (): TimetableFormValues => {
    const emptyDay = () => Array(periods.length).fill({ subject: '', teacher: '' });
    return {
        monday: emptyDay(),
        tuesday: emptyDay(),
        wednesday: emptyDay(),
        thursday: emptyDay(),
        friday: emptyDay(),
        saturday: emptyDay(),
    };
};

export function TimetableManager({ schoolId, classes }: { schoolId: string; classes: ClassData[] }) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialState = { success: false, error: null, message: null };
    const [state, formAction] = useFormState(saveTimetable, initialState);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

    const { control, handleSubmit, reset, getValues } = useForm<TimetableFormValues>({
        resolver: zodResolver(TimetableFormSchema),
        defaultValues: generateEmptyTimetable(),
    });

    useEffect(() => {
        async function fetchTimetable() {
            if (selectedClassId && selectedSection) {
                setLoading(true);
                setIsEditing(false); // Reset editing state on change
                const result = await getTimetable({ schoolId, classId: selectedClassId, section: selectedSection });
                if (result.success && result.data) {
                    reset(result.data);
                } else {
                    reset(generateEmptyTimetable());
                }
                setLoading(false);
            }
        }
        fetchTimetable();
    }, [schoolId, selectedClassId, selectedSection, reset]);

    const onFormSubmit = (data: TimetableFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('classId', selectedClassId);
        formData.append('section', selectedSection);
        Object.entries(data).forEach(([day, periods]) => {
            formData.append(day, JSON.stringify(periods));
        });
        formAction(formData);
        setIsEditing(false);
    };

    const handlePrint = () => {
        if (!selectedClassId || !selectedSection) return;
        const printUrl = `/director/dashboard/${schoolId}/academics/timetable/print?classId=${selectedClassId}&section=${selectedSection}`;
        window.open(printUrl, '_blank');
    }

    const canManageTimetable = selectedClassId && selectedSection;

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                    <Label>Select Class</Label>
                    <Select value={selectedClassId} onValueChange={v => { setSelectedClassId(v); setSelectedSection(''); }}>
                        <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                        <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Select Section</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClassId}>
                        <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                        <SelectContent>{selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            {state.message && (
                <Alert className={cn(state.success ? 'border-green-500 text-green-700' : 'border-destructive text-destructive')}>
                <AlertTitle>{state.success ? 'Success!' : 'Error!'}</AlertTitle>
                <AlertDescription>{state.message || state.error}</AlertDescription>
                </Alert>
            )}

            {loading ? (
                <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
            ) : canManageTimetable ? (
                <form onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="flex justify-end gap-2 mb-4">
                        <Button type="button" variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Timetable
                        </Button>
                        {!isEditing ? (
                            <Button type="button" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Timetable
                            </Button>
                        ) : (
                           <>
                             <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                             <Button type="submit">
                                <Save className="mr-2 h-4 w-4" />
                                Save Timetable
                            </Button>
                           </>
                        )}
                    </div>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px] font-bold">Day</TableHead>
                                    {periods.map(period => <TableHead key={period} className="font-bold">{period}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {daysOfWeek.map(day => (
                                    <TableRow key={day}>
                                        <TableCell className="font-medium capitalize">{day}</TableCell>
                                        {periods.map((_, periodIndex) => (
                                            <TableCell key={periodIndex}>
                                                {isEditing ? (
                                                    <div className="space-y-1">
                                                        <Controller
                                                            name={`${day}.${periodIndex}.subject`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} placeholder="Subject" className="h-8 text-xs" />
                                                            )}
                                                        />
                                                         <Controller
                                                            name={`${day}.${periodIndex}.teacher`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input {...field} placeholder="Teacher" className="h-8 text-xs" />
                                                            )}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-semibold">{getValues(`${day}.${periodIndex}.subject`) || '-'}</p>
                                                        <p className="text-xs text-muted-foreground">{getValues(`${day}.${periodIndex}.teacher`)}</p>
                                                    </div>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </form>
            ) : (
                <div className="text-center py-10 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">Please select a class and section to manage the timetable.</p>
                </div>
            )}
        </div>
    );
}
