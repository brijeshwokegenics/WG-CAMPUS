
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { format, getDaysInMonth, parseISO, isSunday } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

import { cn } from '@/lib/utils';
import { getUsersForSchool } from '@/app/actions/users';
import { saveStaffAttendance, getStaffAttendanceForDate, getMonthlyStaffAttendance } from '@/app/actions/hr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';


type User = { id: string; name: string, userId: string };
type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = Record<string, AttendanceStatus>;

export function StaffAttendanceManager({ schoolId }: { schoolId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [staff, setStaff] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [loading, setLoading] = useState(true);
  
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const initialState = { success: false, error: null, message: null };
  const [state, formAction] = useFormState(saveStaffAttendance, initialState);

  // Fetch staff
  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      const result = await getUsersForSchool(schoolId);
      if (result.success && result.data) {
        setStaff(result.data as User[]);
      }
      setLoading(false);
    }
    fetchStaff();
  }, [schoolId]);

  // Fetch attendance data when date or staff list changes
  useEffect(() => {
    async function fetchAttendance() {
      if (selectedDate && staff.length > 0 && !isSunday(selectedDate)) {
        setLoading(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const result = await getStaffAttendanceForDate({ schoolId, date: dateString });
        
        const initialAttendance: AttendanceRecord = {};
        staff.forEach(user => {
            initialAttendance[user.id] = result.data?.[user.id] || 'Present';
        });
        setAttendance(initialAttendance);
        setLoading(false);
      }
    }
    
    if(selectedDate && isSunday(selectedDate)){
      setAttendance({});
    } else {
      fetchAttendance();
    }
  }, [staff, selectedDate, schoolId]);

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [userId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newAttendance: AttendanceRecord = {};
    staff.forEach(user => {
      newAttendance[user.id] = status;
    });
    setAttendance(newAttendance);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('schoolId', schoolId);
    formData.append('date', format(selectedDate!, 'yyyy-MM-dd'));
    formData.append('attendance', JSON.stringify(attendance));
    formAction(formData);
  };

  const handleGenerateReport = async () => {
    if (!reportMonth) {
        alert("Please select a month for the report.");
        return;
    }
    setGeneratingReport(true);
    const result = await getMonthlyStaffAttendance({ schoolId, month: reportMonth });

    if (result.success && result.data) {
        const { staff, attendance } = result.data;

        const monthDate = parseISO(`${reportMonth}-01`);
        const daysInMonth = getDaysInMonth(monthDate);
        
        const reportData = staff.map((user: any) => {
            const userRow: Record<string, any> = { 'User ID': user.userId, 'Staff Name': user.name };
            
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayHeader = format(date, 'dd-MMM');
                const attendanceRecord = attendance.find((att: any) => att.date === dateStr);
                
                userRow[dayHeader] = attendanceRecord?.attendance?.[user.id]?.charAt(0) || '-';
            }
            return userRow;
        });

        const ws = XLSX.utils.json_to_sheet(reportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Staff Attendance");
        XLSX.writeFile(wb, `Staff_Attendance_${format(monthDate, 'MMMM_yyyy')}.xlsx`);
        setIsReportModalOpen(false);
    } else {
        alert(`Error generating report: ${result.error}`);
    }
    setGeneratingReport(false);
  };
  
  const isDateHoliday = selectedDate ? isSunday(selectedDate) : false;

  return (
    <div className="space-y-6">
      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 border rounded-lg">
         <div className="space-y-2">
          <Label>Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full md:w-[280px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
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
                    disabled={(date) => date > new Date() || isSunday(date)}
                    initialFocus 
                />
            </PopoverContent>
          </Popover>
        </div>
        <div>
             <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Monthly Report
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Monthly Staff Attendance Report</DialogTitle>
                        <DialogDescription>
                            Select a month to download the attendance report in Excel format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
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
                        <Button onClick={handleGenerateReport} disabled={generatingReport} className="w-full">
                            {generatingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {generatingReport ? 'Generating...' : 'Download Report'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
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
      ) : isDateHoliday ? (
        <div className="text-center py-10 border rounded-lg bg-muted/50">
            <p className="text-muted-foreground font-semibold">Today is Sunday, which is a holiday.</p>
        </div>
      ) : staff.length > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('Present')}>Mark All Present</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('Absent')}>Mark All Absent</Button>
                 <Button type="button" variant="outline" size="sm" onClick={() => handleMarkAll('Leave')}>Mark All on Leave</Button>
            </div>
            <div className='border rounded-lg'>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className='w-[100px]'>User ID</TableHead>
                    <TableHead>Staff Name</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.map(user => (
                    <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.userId}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-right">
                        <RadioGroup
                            value={attendance[user.id] || 'Present'}
                            onValueChange={(value) => handleStatusChange(user.id, value as AttendanceStatus)}
                            className="flex justify-end gap-4"
                        >
                            {(['Present', 'Absent', 'Leave'] as AttendanceStatus[]).map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <RadioGroupItem value={status} id={`${user.id}-${status}`} />
                                    <Label htmlFor={`${user.id}-${status}`} className='text-sm'>{status}</Label>
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
      ) : (
         <div className="text-center py-10 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No staff found. Please add users in User Management first.</p>
        </div>
      )}
    </div>
  );
}
