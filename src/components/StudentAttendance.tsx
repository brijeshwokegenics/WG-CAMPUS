
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFormState } from 'react-dom';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveStudentAttendance, getStudentAttendance, getStudentsForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type ClassData = { id: string; name: string; sections: string[] };
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

  const initialState = { success: false, error: null, message: null };
  const [state, formAction] = useFormState(saveStudentAttendance, initialState);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

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
  
  const canTakeAttendance = selectedClassId && selectedSection && selectedDate;

  return (
    <div className="space-y-6">
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
