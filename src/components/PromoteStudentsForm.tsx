
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { promoteStudents, getStudentsForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentData = { id: string; studentName: string; section: string; fatherName: string; };

export function PromoteStudentsForm({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [fromClassId, setFromClassId] = useState('');
    const [fromSection, setFromSection] = useState('');
    const [toClassId, setToClassId] = useState('');
    const [toSection, setToSection] = useState('');
    const [students, setStudents] = useState<StudentData[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
    const [selectAll, setSelectAll] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const initialState = { success: false, error: null, message: null, details: null };
    const [state, formAction] = useFormState(promoteStudents, initialState);

    const fromClass = useMemo(() => classes.find(c => c.id === fromClassId), [classes, fromClassId]);
    const toClass = useMemo(() => classes.find(c => c.id === toClassId), [classes, toClassId]);
    
    useEffect(() => {
        async function fetchStudents() {
            if (fromClassId && fromSection) {
                setLoadingStudents(true);
                const studentData = await getStudentsForSchool({ schoolId, classId: fromClassId, section: fromSection });
                setStudents(studentData);
                setSelectedStudents({});
                setSelectAll(false);
                setLoadingStudents(false);
            } else {
                setStudents([]);
            }
        }
        fetchStudents();
    }, [schoolId, fromClassId, fromSection]);

    useEffect(() => {
        const newSelection: Record<string, boolean> = {};
        if (selectAll) {
            students.forEach(s => newSelection[s.id] = true);
        }
        setSelectedStudents(newSelection);
    }, [selectAll, students]);

    const handleStudentSelect = (studentId: string, isSelected: boolean) => {
        setSelectedStudents(prev => ({ ...prev, [studentId]: isSelected }));
        if (!isSelected) {
            setSelectAll(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const studentIds = Object.entries(selectedStudents)
            .filter(([, isSelected]) => isSelected)
            .map(([id]) => id);
        
        studentIds.forEach(id => formData.append('studentIds', id));
        formAction(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {state.message && (
                <Alert className={cn(state.success ? "border-green-500 text-green-700" : "border-destructive text-destructive")}>
                <AlertTitle>{state.success ? 'Success!' : 'Error!'}</AlertTitle>
                <AlertDescription>{state.message || state.error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FROM SECTION */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Promote From</h3>
                    <input type="hidden" name="schoolId" value={schoolId} />
                     <div className="space-y-2">
                        <Label>Current Class</Label>
                        <Select name="fromClassId" value={fromClassId} onValueChange={setFromClassId}>
                            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Current Section</Label>
                        <Select name="fromSection" value={fromSection} onValueChange={setFromSection} disabled={!fromClassId}>
                            <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                            <SelectContent>
                                {fromClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* TO SECTION */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">Promote To</h3>
                    <div className="space-y-2">
                        <Label>New Class</Label>
                        <Select name="toClassId" value={toClassId} onValueChange={setToClassId}>
                            <SelectTrigger><SelectValue placeholder="Select target class" /></SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>New Section</Label>
                        <Select name="toSection" value={toSection} onValueChange={setToSection} disabled={!toClassId}>
                            <SelectTrigger><SelectValue placeholder="Select target section" /></SelectTrigger>
                            <SelectContent>
                                {toClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {loadingStudents && (
                 <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-muted-foreground mt-2">Loading students...</p>
                 </div>
            )}
            
            {students.length > 0 && !loadingStudents && (
                <div className="border rounded-lg">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectAll}
                                        onCheckedChange={(checked) => setSelectAll(Boolean(checked))}
                                    />
                                </TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Father's Name</TableHead>
                                <TableHead>Admission ID</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <Checkbox
                                            name={`student_${student.id}`}
                                            checked={selectedStudents[student.id] || false}
                                            onCheckedChange={(checked) => handleStudentSelect(student.id, Boolean(checked))}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell>{student.fatherName}</TableCell>
                                    <TableCell className="font-mono text-xs">{student.id}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </div>
            )}
            
            {state.details?.fieldErrors?.studentIds && (
                 <p className="text-sm text-destructive text-center">{state.details.fieldErrors.studentIds.join(', ')}</p>
            )}

            <div className="flex justify-end">
                <Button type="submit" disabled={students.length === 0 || !toClassId || !toSection || Object.values(selectedStudents).every(v => !v)}>
                    Promote Selected Students
                </Button>
            </div>
        </form>
    );
}

