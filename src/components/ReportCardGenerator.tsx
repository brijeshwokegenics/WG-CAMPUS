
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getStudentsForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type ClassData = { id: string; name: string; sections: string[]; };
type Student = { id: string; studentName: string; fatherName: string; };
type ExamTerm = { id: string; name: string; session: string; };

export function ReportCardGenerator({ schoolId, classes, examTerms }: { schoolId: string; classes: ClassData[]; examTerms: ExamTerm[] }) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedExamTermIds, setSelectedExamTermIds] = useState<string[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

    useEffect(() => {
        async function fetchStudents() {
            if (selectedClassId && selectedSection) {
                setLoadingStudents(true);
                const studentData = await getStudentsForSchool({ schoolId, classId: selectedClassId, section: selectedSection });
                setStudents(studentData);
                setSelectedStudent(null); 
                setLoadingStudents(false);
            } else {
                setStudents([]);
            }
        }
        fetchStudents();
    }, [schoolId, selectedClassId, selectedSection]);

    const handleExamTermSelect = (termId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedExamTermIds(prev => [...prev, termId]);
        } else {
            setSelectedExamTermIds(prev => prev.filter(id => id !== termId));
        }
    };

    const handleGenerateReport = () => {
        if (!selectedStudent) {
            alert("Please select a student.");
            return;
        }
        
        if (selectedExamTermIds.length === 0) {
            alert("Please select at least one exam term.");
            return;
        }

        const queryParams = new URLSearchParams({
            studentId: selectedStudent.id,
        });
        selectedExamTermIds.forEach(id => queryParams.append('examTermId', id));

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
                        </CardHeader>
                        <CardContent>
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
                        </CardContent>
                    </Card>

                    {/* Step 3: Select Exams and Generate */}
                    {selectedStudent && (
                        <Card>
                             <CardHeader>
                                <CardTitle>Select Exams for {selectedStudent.studentName}</CardTitle>
                                <CardDescription>Choose one or more exams to include in the report card. The order of selection matters.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                {examTerms.map(term => (
                                     <div key={term.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`term-${term.id}`}
                                            checked={selectedExamTermIds.includes(term.id)}
                                            onCheckedChange={(checked) => handleExamTermSelect(term.id, Boolean(checked))}
                                        />
                                        <Label htmlFor={`term-${term.id}`} className="font-medium">
                                           {term.name} ({term.session})
                                        </Label>
                                    </div>
                                ))}
                                </div>

                                <Button 
                                    onClick={handleGenerateReport} 
                                    disabled={selectedExamTermIds.length === 0}
                                    className="w-full"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate Report Card
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (selectedClassId && selectedSection) && (
                <p className="text-center text-muted-foreground py-8">No students found in this section.</p>
            )}
        </div>
    );
}
