

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
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


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
            <SheetContent className="sm:max-w-full w-full p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Enter Marks for {examTerm.name}</SheetTitle>
                    <SheetDescription>
                        Select a class and section to begin entering marks for students.
                    </SheetDescription>
                </SheetHeader>
                <div className="p-6 space-y-4">
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
                </div>
                 <div className="overflow-x-auto h-[calc(100vh-200px)]">
                     {loading ? (
                        <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (selectedClassId && selectedSection) && (
                         subjects.length > 0 ? (
                                <Table>
                                    <TableHeader className="sticky top-0 bg-background z-10">
                                        <TableRow>
                                            <TableHead className="min-w-[200px]">Student Name</TableHead>
                                            {subjects.map(s => <TableHead key={s.subjectName} className="text-center min-w-[120px]">{s.subjectName} ({s.maxMarks})</TableHead>)}
                                            <TableHead className="min-w-[120px] text-center">Work Ed.</TableHead>
                                            <TableHead className="min-w-[120px] text-center">Art Ed.</TableHead>
                                            <TableHead className="min-w-[120px] text-center">Health Ed.</TableHead>
                                            <TableHead className="min-w-[120px] text-center">Discipline</TableHead>
                                            <TableHead className="min-w-[250px]">Remarks</TableHead>
                                            <TableHead className="text-right min-w-[100px]">Actions</TableHead>
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
    const [coScholastic, setCoScholastic] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        async function fetchMarks() {
            setLoading(true);
            const result = await getMarksForStudent(schoolId, examTermId, student.id);
            if (result.success && result.data) {
                const fetchedData = result.data;
                const initialMarks: Record<string, number | undefined> = {};
                fetchedData.marks.forEach((m: any) => {
                    initialMarks[m.subjectName] = m.marksObtained;
                });
                setMarks(initialMarks);
                setCoScholastic({
                    workEducationGrade: fetchedData.workEducationGrade || '',
                    artEducationGrade: fetchedData.artEducationGrade || '',
                    healthEducationGrade: fetchedData.healthEducationGrade || '',
                    disciplineGrade: fetchedData.disciplineGrade || '',
                    remarks: fetchedData.remarks || '',
                });
            } else {
                // Initialize with empty marks if none are found
                const initialMarks: Record<string, number | undefined> = {};
                subjects.forEach(s => {
                    initialMarks[s.subjectName] = undefined;
                });
                setMarks(initialMarks);
                setCoScholastic({});
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
        formData.append('workEducationGrade', coScholastic.workEducationGrade || '');
        formData.append('artEducationGrade', coScholastic.artEducationGrade || '');
        formData.append('healthEducationGrade', coScholastic.healthEducationGrade || '');
        formData.append('disciplineGrade', coScholastic.disciplineGrade || '');
        formData.append('remarks', coScholastic.remarks || '');


        await saveMarks(null, formData);
        setIsSaving(false);
    };

    const handleMarksChange = (subjectName: string, value: string) => {
        const newMarks = { ...marks };
        const numValue = Number(value);
        const subject = subjects.find(s => s.subjectName === subjectName);
        if (!isNaN(numValue) && subject && numValue >= 0 && numValue <= subject.maxMarks) {
            newMarks[subjectName] = numValue;
        } else if (value === '') {
             newMarks[subjectName] = undefined;
        }
        setMarks(newMarks);
    };

    const handleCoScholasticChange = (field: string, value: string) => {
        setCoScholastic((prev: any) => ({...prev, [field]: value}));
    }

    if (loading) {
        return <TableRow><TableCell colSpan={subjects.length + 7}><Loader2 className="h-4 w-4 animate-spin"/></TableCell></TableRow>;
    }
    
    const gradeOptions = ['A', 'B', 'C'].map(g => ({ label: g, value: g }));

    const GradeSelect = ({ field, placeholder }: { field: string, placeholder: string }) => (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Select value={(coScholastic as any)[field]} onValueChange={(v) => handleCoScholasticChange(field, v)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={placeholder} /></SelectTrigger>
                        <SelectContent>{gradeOptions.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                 </TooltipTrigger>
                 <TooltipContent><p>{placeholder}</p></TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
       <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background">{student.studentName}</TableCell>
            {subjects.map(subject => (
                <TableCell key={subject.subjectName}>
                    <Input 
                        type="number" 
                        className="w-24 text-center"
                        value={marks[subject.subjectName] === undefined ? '' : marks[subject.subjectName]}
                        onChange={(e) => handleMarksChange(subject.subjectName, e.target.value)}
                        max={subject.maxMarks}
                    />
                </TableCell>
            ))}
             <TableCell><GradeSelect field="workEducationGrade" placeholder="Work Education"/></TableCell>
             <TableCell><GradeSelect field="artEducationGrade" placeholder="Art Education"/></TableCell>
             <TableCell><GradeSelect field="healthEducationGrade" placeholder="Health Education"/></TableCell>
             <TableCell><GradeSelect field="disciplineGrade" placeholder="Discipline"/></TableCell>
             <TableCell>
                <Textarea 
                    placeholder="Remarks..." 
                    className="text-xs h-16 w-full" 
                    value={coScholastic.remarks}
                    onChange={(e) => handleCoScholasticChange('remarks', e.target.value)}
                />
            </TableCell>
            <TableCell className="text-right sticky right-0 bg-background">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save'}
                </Button>
            </TableCell>
        </TableRow>
    )
}
