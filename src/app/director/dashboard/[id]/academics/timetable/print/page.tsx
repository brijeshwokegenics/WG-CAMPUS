
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTimetable, getClassesForSchool } from '@/app/actions/academics';
import { getSchool } from '@/app/actions/school';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const periods = Array.from({ length: 8 }, (_, i) => `Period ${i + 1}`);

const generateEmptyTimetable = () => {
    const emptyDay = () => Array(periods.length).fill({ subject: '', teacher: '' });
    return {
        monday: emptyDay(),
        tuesday: emptyDay(),
        wednesday: emptyDay(),
        thursday: emptyDay(),
        friday: emptyDay(),
        saturday: emptyDay(),
    };
};

function TimetablePrintView({ schoolId, classId, section }: { schoolId: string, classId: string, section: string }) {
    const [timetable, setTimetable] = useState<any>(null);
    const [school, setSchool] = useState<any>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const className = useMemo(() => classes.find(c => c.id === classId)?.name, [classes, classId]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [timetableRes, schoolRes, classesRes] = await Promise.all([
                getTimetable({ schoolId, classId, section }),
                getSchool(schoolId),
                getClassesForSchool(schoolId)
            ]);
            
            if (timetableRes.success) {
                // If data is null, create a blank timetable structure
                setTimetable(timetableRes.data || generateEmptyTimetable());
            }
            if (schoolRes.school) {
                setSchool(schoolRes.school);
            }
            if (classesRes.success && classesRes.data) {
                setClasses(classesRes.data);
            }
            setLoading(false);
        }
        fetchData();
    }, [schoolId, classId, section]);

    useEffect(() => {
        if (!loading && timetable && school) {
            setTimeout(() => window.print(), 500);
        }
    }, [loading, timetable, school]);

    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Timetable for Printing...</div>;
    }

    if (!timetable || !school || !className) {
        return <div className="p-8 text-center">Could not load timetable data. Please ensure the class and school exist.</div>;
    }

    return (
        <div className="bg-white text-black font-sans">
            <style type="text/css" media="print">{`
                @page { 
                    size: A4 landscape; 
                    margin: 15mm;
                }
                body { 
                    -webkit-print-color-adjust: exact; 
                    background: white !important; 
                    color: black !important;
                }
                .no-print { display: none; }
                .print-container { 
                    border: none; 
                    padding: 0;
                    margin: 0;
                }
                table { 
                    border-collapse: collapse; 
                    width: 100%; 
                    font-size: 10px; /* Smaller font for better fit */
                }
                th, td { 
                    border: 1px solid black; 
                    padding: 4px; /* Reduced padding */
                    text-align: center; 
                }
                th { background-color: #f2f2f2 !important; }
                .screen-view { display: none; }
            `}</style>
            
            {/* On-screen view for centering */}
            <div className="screen-view p-8 flex justify-center items-center min-h-screen bg-gray-100">
                <div className="print-container w-full max-w-5xl shadow-lg p-8 bg-white">
                    {/* Content duplicated for screen view */}
                    <TimetableContent school={school} className={className} section={section} timetable={timetable} />
                </div>
            </div>

            {/* Hidden for screen, visible for print */}
            <div className="print-container hidden print:block">
                 <TimetableContent school={school} className={className} section={section} timetable={timetable} />
            </div>

            <div className="fixed bottom-4 right-4 no-print">
                 <p className="text-xs text-gray-500">You can close this window after printing.</p>
                 <Button onClick={() => window.close()} className="mt-2 px-4 py-2 bg-gray-200 rounded">Close</Button>
            </div>
        </div>
    );
}

// Reusable content component
const TimetableContent = ({ school, className, section, timetable }: any) => (
    <>
        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider">{school.schoolName}</h1>
            <p className="text-sm text-gray-700">{school.address}, {school.city}</p>
            <h2 className="text-2xl font-semibold mt-4">CLASS TIMETABLE</h2>
        </div>

        <div className="flex justify-between items-center mb-4 text-xl">
            <p><strong>Class:</strong> {className}</p>
            <p><strong>Section:</strong> {section}</p>
        </div>

        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px] font-bold">Day/Period</TableHead>
                    {periods.map(period => <TableHead key={period} className="font-bold">{period}</TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {daysOfWeek.map(day => (
                    <TableRow key={day}>
                        <TableCell className="font-bold capitalize">{day}</TableCell>
                        {periods.map((_, periodIndex) => (
                            <TableCell key={periodIndex}>
                                <div>
                                    <p className="font-semibold h-4">{timetable[day]?.[periodIndex]?.subject || ''}</p>
                                    <p className="text-xs text-gray-600 h-3">{timetable[day]?.[periodIndex]?.teacher || ''}</p>
                                </div>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </>
);


export default function TimetablePrintPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const classId = searchParams.get('classId');
    const section = searchParams.get('section');

    if (!classId || !section) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Error: Class ID and Section are required to print a timetable.</p>
            </div>
        );
    }
    
    return <TimetablePrintView schoolId={params.id} classId={classId} section={section} />;
}
