
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getUsersForSchool } from '@/app/actions/users';
import { saveStaffAttendance, getStaffAttendanceForDate } from '@/app/actions/hr';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type User = { id: string; name: string, userId: string };
type AttendanceStatus = 'Present' | 'Absent' | 'Leave';
type AttendanceRecord = Record<string, AttendanceStatus>;

export function StaffAttendanceManager({ schoolId }: { schoolId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [staff, setStaff] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [loading, setLoading] = useState(true);

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
      if (selectedDate && staff.length > 0) {
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
    fetchAttendance();
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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3">
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
