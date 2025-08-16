
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { format, parseISO, getDaysInMonth } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import { cn } from '@/lib/utils';
import { saveStudentAttendance, getStudentAttendance, getStudentsForSchool, getMonthlyAttendance } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';

type ClassData = { id: string; name: string; sections: string[]; };
type StudentData = { id: string; studentName: string };
type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';
type AttendanceRecord = Record<string, AttendanceStatus>;

export function StudentAttendance({ schoolId, classes }: { schoolId: string; classes: ClassData[] }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [students, setStudents] = useState<StudentData[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [loading, setLoading] = useState(false);
  
  const [reportClassId, setReportClassId] = useState('');
  const [reportSection, setReportSection] = useState('');
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const initialState = { success: false, error: null, message: null };
  const [state, formAction] = useFormState(saveStudentAttendance, initialState);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);
  const reportSelectedClass = useMemo(() => classes.find(c => c.id === reportClassId), [classes, reportClassId]);

  // Fetch students when class/section changes
  useEffect(() => {
    async function fetchStudents() {
      if (selectedClassId && selectedSection) {
        setLoading(true);
        const studentData = await getStudentsForSchool({ schoolId, classId: selectedClassId, section: selectedSection });
        setStudents(studentData);
        setLoading(false);
      } else {
        setStudents([]);
      }
    }
    fetchStudents();
  }, [schoolId, selectedClassId, selectedSection]);

  // Fetch attendance data when date, class, or section changes
  useEffect(() => {
    async function fetchAttendance() {
      if (selectedClassId && selectedSection && selectedDate) {
        setLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const result = await getStudentAttendance({ schoolId, classId: selectedClassId, section: selectedSection, date: dateString });
        
        const initialAttendance: AttendanceRecord = {};
        students.forEach(student => {
            initialAttendance[student.id] = result.data?.[student.id] || 'Present';
        });
        setAttendance(initialAttendance);
        setLoading(false);
      }
    }

    if (students.length > 0) {
      fetchAttendance();
    } else {
        setAttendance({});
    }
  }, [students, selectedDate, schoolId, selectedClassId, selectedSection]);

  // Sync main filter to report filter when modal opens
  useEffect(() => {
    if (isReportModalOpen) {
        setReportClassId(selectedClassId);
        setReportSection(selectedSection);
    }
  }, [isReportModalOpen, selectedClassId, selectedSection]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newAttendance: AttendanceRecord = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('schoolId', schoolId);
    formData.append('classId', selectedClassId);
    formData.append('section', selectedSection);
    formData.append('date', format(selectedDate!, 'yyyy-MM-dd'));
    formData.append('attendance', JSON.stringify(attendance));
    formAction(formData);
  };
  
  const handleGenerateReport = async () => {
    if (!reportClassId || !reportSection || !reportMonth) {
        alert("Please select a class, section, and month for the report.");
        return;
    }
    setGeneratingReport(true);
    const result = await getMonthlyAttendance({ schoolId, classId: reportClassId, section: reportSection, month: reportMonth });

    if (result.success && result.data) {
        const { students, attendance } = result.data;
        const className = classes.find(c => c.id === reportClassId)?.name;
        const sectionName = reportSection;

        const monthDate = parseISO(`${reportMonth}-01`);
        const daysInMonth = getDaysInMonth(monthDate);
        
        const reportData = students.map((student: any) => {
            const studentRow: Record<string, any> = { 'Admission ID': student.id, 'Student Name': student.studentName };
            
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayHeader = format(date, 'dd-MMM');
                const attendanceRecord = attendance.find((att: any) => att.date === dateStr);
                
                // Get the first character of the status, or '-' if no record or no status for the student
                studentRow[dayHeader] = attendanceRecord?.attendance?.[student.id]?.charAt(0) || '-';
            }
            return studentRow;
        });

        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_${className}_${sectionName}_${format(monthDate, 'MMMM_yyyy')}.xlsx`);
        setIsReportModalOpen(false);
    } else {
        alert(`Error generating report: ${result.error}`);
    }
    setGeneratingReport(false);
  };
  
  const canTakeAttendance = selectedClassId && selectedSection && selectedDate;

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Monthly Report
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Monthly Attendance Report</DialogTitle>
                        <DialogDescription>
                            Select a class, section, and month to download the attendance report in Excel format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                         <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select value={reportClassId} onValueChange={setReportClassId}>
                                <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Select Section</Label>
                            <Select value={reportSection} onValueChange={setReportSection} disabled={!reportClassId}>
                                <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                                <SelectContent>{reportSelectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                       <div className="space-y-2 flex-grow">
                            <Label htmlFor="report-month">Report Month</Label>
                            <Input 
                                id="report-month"
                                type="month" 
                                value={reportMonth} 
                                onChange={(e) => setReportMonth(e.target.value)}
                                max={format(new Date(), 'yyyy-MM')}
                            />
                        </div>
                        <Button onClick={handleGenerateReport} disabled={!reportClassId || !reportSection || generatingReport} className="w-full">
                            {generatingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {generatingReport ? 'Generating...' : 'Download Report'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
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
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar 
                    mode="single" 
                    selected={selectedDate} 
                    onSelect={setSelectedDate} 
                    toDate={new Date()}
                    disabled={(date) => date > new Date()}
                    initialFocus 
                />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {state.message && (
        <Alert className={cn(state.success ? 'border-green-500 text-green-700' : 'border-destructive text-destructive')}>
          <AlertTitle>{state.success ? 'Success!' : 'Error!'}</AlertTitle>
          <AlertDescription>{state.message || state.error}</AlertDescription>
        </Alert>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
      ) : canTakeAttendance && students.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('Present')}>Mark All Present</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('Absent')}>Mark All Absent</Button>
            </div>
            <div className='border rounded-lg'>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className='w-[100px]'>Admission ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map(student => (
                    <TableRow key={student.id}>
                        <TableCell className="font-mono text-xs">{student.id}</TableCell>
                        <TableCell className="font-medium">{student.studentName}</TableCell>
                        <TableCell className="text-right">
                        <RadioGroup
                            value={attendance[student.id] || 'Present'}
                            onValueChange={(value) => handleStatusChange(student.id, value as AttendanceStatus)}
                            className="flex justify-end gap-4"
                        >
                            {(['Present', 'Absent', 'Late', 'Half Day'] as AttendanceStatus[]).map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <RadioGroupItem value={status} id={`${student.id}-${status}`} />
                                    <Label htmlFor={`${student.id}-${status}`} className='text-sm'>{status}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          <div className="flex justify-end">
            <Button type="submit">Save Attendance</Button>
          </div>
        </form>
      ) : canTakeAttendance ? (
        <div className="text-center py-10 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No students found for the selected class and section.</p>
        </div>
      ) : (
         <div className="text-center py-10 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Please select a class, section, and date to view or take attendance.</p>
        </div>
      )}
    </div>
  );
}
