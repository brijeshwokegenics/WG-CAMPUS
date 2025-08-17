
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getClassesForSchool, getStudentsForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead,TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Printer, AlertCircle } from 'lucide-react';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentData = { id: string; studentName: string; fatherName: string; feesPaid: boolean; };
type PrintType = 'id-card' | 'admission-card' | 'tc' | 'exam-admit-card' | 'bonafide-certificate' | 'character-certificate';


export default function PrintCenterPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSection, setSelectedSection] = useState<string>('');
    const [students, setStudents] = useState<StudentData[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
    const [printType, setPrintType] = useState<PrintType>('id-card');
    const [selectAll, setSelectAll] = useState(false);
    
    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

    useEffect(() => {
        async function fetchClasses() {
            const result = await getClassesForSchool(schoolId);
            if (result.success && result.data) {
                setClasses(result.data);
            }
        }
        fetchClasses();
    }, [schoolId]);
    
    useEffect(() => {
        async function fetchStudents() {
            if (selectedClassId && selectedSection) {
                const studentData = await getStudentsForSchool({ schoolId, classId: selectedClassId, section: selectedSection });
                setStudents(studentData);
                setSelectedStudents({}); // Reset selection when class/section changes
                setSelectAll(false);
            } else {
                setStudents([]);
            }
        }
        fetchStudents();
    }, [schoolId, selectedClassId, selectedSection]);

    useEffect(() => {
        const newSelection: Record<string, boolean> = {};
        if (selectAll) {
            students.forEach(s => newSelection[s.id] = true);
        }
        setSelectedStudents(newSelection);
    }, [selectAll, students]);

    const handleStudentSelect = (studentId: string, isSelected: boolean) => {
        setSelectedStudents(prev => ({...prev, [studentId]: isSelected}));
        if (!isSelected) {
            setSelectAll(false);
        }
    };

    const handlePrint = (isBulk: boolean) => {
        const studentIdsToPrint = Object.entries(selectedStudents)
            .filter(([, isSelected]) => isSelected)
            .map(([id]) => id);

        if (studentIdsToPrint.length === 0) {
            alert("Please select at least one student to print.");
            return;
        }

        if (printType === 'exam-admit-card') {
            const unpaidStudents = studentIdsToPrint.filter(id => {
                const student = students.find(s => s.id === id);
                return student && !student.feesPaid;
            });
            if (unpaidStudents.length > 0) {
                 alert(`Cannot print Admit Cards. The following students have pending fees: ${unpaidStudents.map(id => students.find(s => s.id === id)?.studentName).join(', ')}`);
                 return;
            }
        }

        // For now, we will open each in a new tab. A better bulk print would generate a single PDF.
        studentIdsToPrint.forEach(studentId => {
            const printUrl = `/director/dashboard/${schoolId}/academics/students/${studentId}/print/${printType}`;
            window.open(printUrl, '_blank');
        });
    }

    const documentTypes: {value: PrintType, label: string}[] = [
        { value: 'id-card', label: 'ID Card'},
        { value: 'admission-card', label: 'Admission Card'},
        { value: 'exam-admit-card', label: 'Exam Admit Card'},
        { value: 'tc', label: 'Transfer Certificate (TC)'},
        { value: 'bonafide-certificate', label: 'Bonafide Certificate'},
        { value: 'character-certificate', label: 'Character Certificate'},
    ];


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Print Center</h1>
                <p className="text-muted-foreground">Generate and print documents for students in bulk or individually.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Document Generation</CardTitle>
                    <CardDescription>Select a class, section, and document type to begin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Select Section</Label>
                            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClassId}>
                                <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                                <SelectContent>
                                    {selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Document Type</Label>
                             <Select value={printType} onValueChange={(value) => setPrintType(value as PrintType)}>
                                <SelectTrigger><SelectValue placeholder="Select document" /></SelectTrigger>
                                <SelectContent>
                                    {documentTypes.map(doc => <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={() => handlePrint(true)} disabled={Object.values(selectedStudents).every(v => !v)}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print for Selected
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {students.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                         <CardDescription>Select students from the list below to print their documents.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    <TableHead>Fees Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedStudents[student.id] || false}
                                                onCheckedChange={(checked) => handleStudentSelect(student.id, Boolean(checked))}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{student.studentName}</TableCell>
                                        <TableCell>{student.fatherName}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${student.feesPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {student.feesPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                         </Table>
                    </CardContent>
                 </Card>
            )}

            {printType === 'exam-admit-card' && (
                <div className="flex items-start gap-2 rounded-md border border-blue-300 bg-blue-50 p-4 text-sm text-blue-800">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>
                        Note: Exam Admit Cards can only be printed for students whose fees have been marked as 'Paid'. Students with pending fees will be skipped during the printing process.
                    </p>
                </div>
            )}
        </div>
    )
}

    