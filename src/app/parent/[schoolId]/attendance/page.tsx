
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getStudentsByParentId, getMonthlyAttendance } from '@/app/actions/academics';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDaysInMonth, format, startOfMonth } from 'date-fns';
import Link from 'next/link';


async function AttendanceContent({ schoolId, parentId }: { schoolId: string, parentId: string }) {
    const studentRes = await getStudentsByParentId(schoolId, parentId);

    if (!studentRes.success || !studentRes.data || studentRes.data.length === 0) {
        return <p className="text-muted-foreground">No student linked to this account.</p>;
    }
    const student = studentRes.data[0];

    const currentMonthDate = new Date();
    const month = format(currentMonthDate, 'yyyy-MM');
    const attendanceRes = await getMonthlyAttendance({ schoolId, classId: student.classId, section: student.section, month });
    const attendanceData = attendanceRes.success ? attendanceRes.data?.attendance : [];
    
    const monthStart = startOfMonth(currentMonthDate);
    const daysInMonth = getDaysInMonth(currentMonthDate);
    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatusForDay = (day: number) => {
        const fullDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
        const dateStr = format(fullDate, 'yyyy-MM-dd');
        const record = attendanceData?.find((att: any) => att.date === dateStr);
        return record?.attendance?.[student.id] || null;
    };
    
    const statusColors: Record<string, string> = {
        'Present': 'bg-green-500',
        'Absent': 'bg-red-500',
        'Late': 'bg-yellow-500',
        'Half Day': 'bg-blue-500',
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance for {format(new Date(), 'MMMM yyyy')}</CardTitle>
                <CardDescription>Viewing attendance for {student.studentName}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map(day => {
                        const status = getStatusForDay(day);
                        return (
                            <div key={day} className="flex flex-col items-center justify-center p-2 border rounded-md h-16">
                                <span className="font-semibold">{day}</span>
                                {status ? (
                                    <span className={`h-2 w-2 rounded-full mt-1 ${statusColors[status]}`} title={status}></span>
                                ) : (
                                    <span className="text-xs text-muted-foreground mt-1">-</span>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${color}`}></div>
                            <span>{status}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default async function ParentAttendancePage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;

    const parentSnapshot = await getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'Parent')));
    const parent = parentSnapshot.docs.length > 0 ? { id: parentSnapshot.docs[0].id } : null;

    if (!parent) {
        return <p>Parent account not found.</p>;
    }

    return (
        <div className="space-y-6">
            <Link href={`/parent/${schoolId}/dashboard`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <AttendanceContent schoolId={schoolId} parentId={parent.id} />
            </Suspense>
        </div>
    );
}
