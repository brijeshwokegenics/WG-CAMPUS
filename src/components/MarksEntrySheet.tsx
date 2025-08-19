
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { getStudentsForSchool, getExamSchedule, saveMarks, getMarksForStudent } from '@/app/actions/academics';

type ClassData = { id: string; name: string; sections: string[]; };
type ExamTerm = { id: string; name: string; session: string; };
type Student = { id: string; studentName: string; };
type Subject = { subjectName: string; maxMarks: number; };

interface MarksEntrySheetProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    examTerm: ExamTerm;
    schoolId: string;
    classes: ClassData[];
}

export function MarksEntrySheet({ isOpen, setIsOpen, examTerm, schoolId, classes }: MarksEntrySheetProps) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

    useEffect(() => {
        async function fetchData() {
            if (selectedClassId && selectedSection) {
                setLoading(true);
                const studentResult = await getStudentsForSchool({ schoolId, classId: selectedClassId, section: selectedSection, rowsPerPage: 1000 });
                setStudents(studentResult.students || []);

                const scheduleData = await getExamSchedule(schoolId, examTerm.id, selectedClassId);
                if (scheduleData.success && scheduleData.data) {
                    setSubjects(scheduleData.data.subjects);
                } else {
                    setSubjects([]);
                }
                setLoading(false);
            }
        }
        fetchData();
    }, [schoolId, examTerm.id, selectedClassId, selectedSection]);
    
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="sm:max-w-full w-full md:w-3/4 lg:w-2/3">
                <SheetHeader>
                    <SheetTitle>Enter Marks for {examTerm.name}</SheetTitle>
                    <SheetDescription>
                        Select a class and section to begin entering marks for students.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
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
                     {loading ? (
                        <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (selectedClassId && selectedSection) && (
                         subjects.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            {subjects.map(s => <TableHead key={s.subjectName} className="text-center">{s.subjectName} ({s.maxMarks})</TableHead>)}
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <StudentMarksRow 
                                                key={student.id} 
                                                student={student} 
                                                subjects={subjects} 
                                                schoolId={schoolId}
                                                examTermId={examTerm.id}
                                                classId={selectedClassId}
                                                section={selectedSection}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : <p className="text-center text-muted-foreground p-8">No exam schedule found for this class. Please create a schedule first.</p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// Sub-component for each student row to manage its own form state
function StudentMarksRow({ student, subjects, schoolId, examTermId, classId, section }: { student: Student, subjects: Subject[], schoolId: string, examTermId: string, classId: string, section: string }) {
    
    const [marks, setMarks] = useState<Record<string, number | undefined>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        async function fetchMarks() {
            setLoading(true);
            const result = await getMarksForStudent(schoolId, examTermId, student.id);
            if (result.success && result.data) {
                const initialMarks: Record<string, number | undefined> = {};
                result.data.marks.forEach((m: any) => {
                    initialMarks[m.subjectName] = m.marksObtained;
                });
                setMarks(initialMarks);
            } else {
                // Initialize with empty marks if none are found
                const initialMarks: Record<string, number | undefined> = {};
                subjects.forEach(s => {
                    initialMarks[s.subjectName] = undefined;
                });
                setMarks(initialMarks);
            }
            setLoading(false);
        }
        fetchMarks();
    }, [student.id, examTermId, schoolId, subjects]);

    const handleSave = async () => {
        setIsSaving(true);
        const marksPayload = subjects.map(s => ({
            subjectName: s.subjectName,
            marksObtained: marks[s.subjectName] || undefined,
        }));
        
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('examTermId', examTermId);
        formData.append('classId', classId);
        formData.append('section', section);
        formData.append('studentId', student.id);
        formData.append('marks', JSON.stringify(marksPayload));

        await saveMarks(null, formData);
        setIsSaving(false);
    };

    const handleMarksChange = (subjectName: string, value: string) => {
        const newMarks = { ...marks };
        const numValue = Number(value);
        const subject = subjects.find(s => s.subjectName === subjectName);
        if (!isNaN(numValue) && subject && numValue <= subject.maxMarks) {
            newMarks[subjectName] = numValue;
        } else if (value === '') {
             newMarks[subjectName] = undefined;
        }
        setMarks(newMarks);
    };

    if (loading) {
        return <TableRow><TableCell colSpan={subjects.length + 2}><Loader2 className="h-4 w-4 animate-spin"/></TableCell></TableRow>;
    }

    return (
        <TableRow>
            <TableCell className="font-medium">{student.studentName}</TableCell>
            {subjects.map(subject => (
                <TableCell key={subject.subjectName}>
                    <Input 
                        type="number" 
                        className="w-20 text-center"
                        value={marks[subject.subjectName] === undefined ? '' : marks[subject.subjectName]}
                        onChange={(e) => handleMarksChange(subject.subjectName, e.target.value)}
                        max={subject.maxMarks}
                    />
                </TableCell>
            ))}
            <TableCell className="text-right">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save'}
                </Button>
            </TableCell>
        </TableRow>
    )
}
