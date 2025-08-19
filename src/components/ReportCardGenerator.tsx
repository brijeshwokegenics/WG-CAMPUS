
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getStudentsForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, ArrowUp, ArrowDown, X, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type ClassData = { id: string; name: string; sections: string[]; };
type Student = { id: string; studentName: string; fatherName: string; };
type ExamTerm = { id: string; name: string; session: string; };

export function ReportCardGenerator({ schoolId, classes, examTerms }: { schoolId: string; classes: ClassData[]; examTerms: ExamTerm[] }) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedExamTerms, setSelectedExamTerms] = useState<ExamTerm[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

    useEffect(() => {
        async function fetchStudents() {
            if (selectedClassId && selectedSection) {
                setLoadingStudents(true);
                const studentResult = await getStudentsForSchool({ schoolId, classId: selectedClassId, section: selectedSection, rowsPerPage: 1000 });
                setStudents(studentResult.students || []);
                setSelectedStudent(null); 
                setLoadingStudents(false);
            } else {
                setStudents([]);
            }
        }
        fetchStudents();
    }, [schoolId, selectedClassId, selectedSection]);
    
    useEffect(() => {
        // Reset selected terms when student changes
        setSelectedExamTerms([]);
    }, [selectedStudent]);

    const availableExamTerms = useMemo(() => {
        return examTerms.filter(term => !selectedExamTerms.some(selected => selected.id === term.id));
    }, [examTerms, selectedExamTerms]);

    const addExamTerm = (term: ExamTerm) => {
        setSelectedExamTerms(prev => [...prev, term]);
    };

    const removeExamTerm = (termId: string) => {
        setSelectedExamTerms(prev => prev.filter(term => term.id !== termId));
    };

    const moveExamTerm = (index: number, direction: 'up' | 'down') => {
        const newSelectedTerms = [...selectedExamTerms];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < newSelectedTerms.length) {
            const temp = newSelectedTerms[index];
            newSelectedTerms[index] = newSelectedTerms[newIndex];
            newSelectedTerms[newIndex] = temp;
            setSelectedExamTerms(newSelectedTerms);
        }
    };

    const handleGenerateReport = () => {
        if (!selectedStudent) {
            alert("Please select a student.");
            return;
        }
        
        if (selectedExamTerms.length === 0) {
            alert("Please select at least one exam term.");
            return;
        }

        const queryParams = new URLSearchParams({
            studentId: selectedStudent.id,
        });
        selectedExamTerms.forEach(term => queryParams.append('examTermId', term.id));

        const reportUrl = `/director/dashboard/${schoolId}/academics/reports/view?${queryParams.toString()}`;
        window.open(reportUrl, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Select Class and Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {loadingStudents ? (
                <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Step 2: Select Student */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select a Student</CardTitle>
                             <CardDescription>Click 'Select' to choose a student for the report.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Father's Name</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow 
                                                key={student.id} 
                                                className={selectedStudent?.id === student.id ? 'bg-muted' : ''}
                                            >
                                                <TableCell className="font-medium">{student.studentName}</TableCell>
                                                <TableCell>{student.fatherName}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        size="sm" 
                                                        variant={selectedStudent?.id === student.id ? 'default' : 'outline'}
                                                        onClick={() => setSelectedStudent(student)}
                                                    >
                                                        Select
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>

                    {/* Step 3: Select Exams and Generate */}
                    <Card>
                         <CardHeader>
                            <CardTitle>Build Report for {selectedStudent ? selectedStudent.studentName : '...'}</CardTitle>
                            <CardDescription>Add exams and set their order for the report card.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Available Exams</h4>
                                    <div className="border rounded-md p-2 space-y-2 min-h-[150px]">
                                        {availableExamTerms.map(term => (
                                            <div key={term.id} className="flex items-center justify-between text-sm">
                                                <span>{term.name}</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => addExamTerm(term)} disabled={!selectedStudent}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {availableExamTerms.length === 0 && <p className="text-xs text-muted-foreground p-2">No more exams to add.</p>}
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                     <h4 className="font-semibold text-sm">Selected for Report</h4>
                                     <div className="border rounded-md p-2 space-y-2 min-h-[150px]">
                                        {selectedExamTerms.map((term, index) => (
                                            <div key={term.id} className="flex items-center justify-between text-sm bg-muted p-1 rounded-md">
                                                <span className="font-medium flex-grow">{index + 1}. {term.name}</span>
                                                <div className="flex items-center">
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveExamTerm(index, 'up')} disabled={index === 0}>
                                                        <ArrowUp className="h-4 w-4"/>
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveExamTerm(index, 'down')} disabled={index === selectedExamTerms.length - 1}>
                                                        <ArrowDown className="h-4 w-4"/>
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeExamTerm(term.id)}>
                                                        <X className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                         {selectedExamTerms.length === 0 && <p className="text-xs text-muted-foreground p-2">Add exams from the left.</p>}
                                    </div>
                                </div>
                            </div>
                            <Button 
                                onClick={handleGenerateReport} 
                                disabled={!selectedStudent || selectedExamTerms.length === 0}
                                className="w-full"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report Card
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (selectedClassId && selectedSection) && (
                <p className="text-center text-muted-foreground py-8">No students found in this section.</p>
            )}
        </div>
    );
}
