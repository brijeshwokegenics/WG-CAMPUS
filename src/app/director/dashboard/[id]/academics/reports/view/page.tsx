
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStudentById, getMarksForStudent, getExamSchedule, getExamTerms } from '@/app/actions/academics';
import { getSchool } from '@/app/actions/school';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type Student = any;
type School = any;
type MarksData = any;
type Subject = { subjectName: string; maxMarks: number; };

function ReportCardView({ schoolId, studentId, examTermIds }: { schoolId: string, studentId: string, examTermIds: string[] }) {
    const [student, setStudent] = useState<Student>(null);
    const [school, setSchool] = useState<School>(null);
    const [allMarks, setAllMarks] = useState<Record<string, MarksData>>({});
    const [allSubjects, setAllSubjects] = useState<Record<string, Subject[]>>({});
    const [examTerms, setExamTerms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            
            const studentRes = await getStudentById(studentId, schoolId);
            if (studentRes.success && studentRes.data) {
                setStudent(studentRes.data);
                
                const [schoolRes, termsRes, ...marksAndSchedules] = await Promise.all([
                    getSchool(schoolId),
                    getExamTerms(schoolId),
                    ...examTermIds.flatMap(termId => [
                        getMarksForStudent(schoolId, termId, studentId),
                        getExamSchedule(schoolId, termId, studentRes.data.classId)
                    ])
                ]);

                if (schoolRes.school) setSchool(schoolRes.school);
                if (termsRes.success) {
                    // Sort the fetched terms to match the order in examTermIds
                    const sortedTerms = examTermIds.map(id => termsRes.data.find((t: any) => t.id === id)).filter(Boolean);
                    setExamTerms(sortedTerms);
                }

                const marks: Record<string, MarksData> = {};
                const subjects: Record<string, Subject[]> = {};
                
                examTermIds.forEach((termId, index) => {
                    const marksResult = marksAndSchedules[index * 2];
                    const scheduleResult = marksAndSchedules[index * 2 + 1];

                    if (marksResult.success && marksResult.data) {
                        marks[termId] = marksResult.data;
                    }
                    if (scheduleResult.success && scheduleResult.data) {
                        subjects[termId] = scheduleResult.data.subjects;
                    }
                });
                
                setAllMarks(marks);
                setAllSubjects(subjects);

            } else {
                 setStudent(null);
            }
             setLoading(false);
        }

        if (schoolId && studentId && examTermIds.length > 0) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [schoolId, studentId, examTermIds]);
    
    useEffect(() => {
        if (!loading && student && school) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading, student, school]);

    const uniqueSubjects = useMemo(() => {
        const subjectSet = new Set<string>();
        examTermIds.forEach(termId => {
            allSubjects[termId]?.forEach(subject => {
                subjectSet.add(subject.subjectName);
            });
        });
        return Array.from(subjectSet);
    }, [allSubjects, examTermIds]);

    const { grandTotal, finalResult, grade } = useMemo(() => {
        let totalMaxMarks = 0;
        let totalMarksObtained = 0;
        let isFail = false;
        const PASS_PERCENTAGE = 33;

        uniqueSubjects.forEach(subjectName => {
            let subjectTotalMax = 0;
            let subjectTotalObtained = 0;

            examTermIds.forEach(termId => {
                const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                
                subjectTotalMax += subjectInfo?.maxMarks || 0;
                subjectTotalObtained += marksInfo?.marksObtained ?? 0;
            });
            
            totalMaxMarks += subjectTotalMax;
            totalMarksObtained += subjectTotalObtained;
            
            if (subjectTotalMax > 0 && (subjectTotalObtained / subjectTotalMax) * 100 < PASS_PERCENTAGE) {
                isFail = true;
            }
        });

        const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
        
        let calculatedGrade = 'F';
        if (percentage > 90) calculatedGrade = 'A+';
        else if (percentage > 80) calculatedGrade = 'A';
        else if (percentage > 70) calculatedGrade = 'B';
        else if (percentage > 60) calculatedGrade = 'C';
        else if (percentage > 50) calculatedGrade = 'D';
        else if (percentage >= PASS_PERCENTAGE) calculatedGrade = 'E';

        return {
            grandTotal: {
                max: totalMaxMarks,
                obtained: totalMarksObtained,
                percentage: percentage.toFixed(2)
            },
            finalResult: isFail ? 'Fail' : 'Pass',
            grade: isFail ? 'F' : calculatedGrade,
        };

    }, [uniqueSubjects, allSubjects, allMarks, examTermIds]);


    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Report Card...</div>;
    }

    if (!student || !school) {
        return <div className="p-8 text-center">Could not load student or school data.</div>;
    }

    return (
         <div className="bg-white text-black font-sans p-8">
            <style type="text/css" media="print">
              {`
                @page { size: A4; margin: 20mm; }
                body { -webkit-print-color-adjust: exact; background: white !important; color: black !important; }
                .no-print { display: none; }
                .report-card-container { border: 2px solid black; padding: 1.5rem; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
                th { background-color: #f2f2f2 !important; }
              `}
            </style>
            
            <div className="report-card-container">
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold uppercase tracking-wider">{school.schoolName}</h1>
                    <p className="text-lg text-gray-700">{school.address}, {school.city}</p>
                    <h2 className="text-2xl font-semibold mt-4">ACADEMIC REPORT CARD</h2>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <p><strong>Student Name:</strong> {student.studentName}</p>
                    <p><strong>Admission ID:</strong> {studentId}</p>
                    <p><strong>Class & Section:</strong> {student.className} - {student.section}</p>
                    <p><strong>Date of Birth:</strong> {format(student.dob, 'PPP')}</p>
                    <p><strong>Father's Name:</strong> {student.fatherName}</p>
                    <p><strong>Session:</strong> {examTerms[0]?.session || ''}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th rowSpan={2}>Subjects</th>
                            {examTerms.map(term => (
                                <th key={term.id} colSpan={2}>{term.name}</th>
                            ))}
                            <th colSpan={2}>Grand Total</th>
                        </tr>
                        <tr>
                            {examTermIds.map(termId => (
                                <React.Fragment key={termId}>
                                    <th>Max Marks</th>
                                    <th>Marks Obt.</th>
                                </React.Fragment>
                            ))}
                            <th>Max Marks</th>
                            <th>Marks Obt.</th>
                        </tr>
                    </thead>
                    <tbody>
                       {uniqueSubjects.map(subjectName => {
                            let subjectRowMax = 0;
                            let subjectRowObtained = 0;
                            return (
                                <tr key={subjectName}>
                                    <td className="text-left font-semibold">{subjectName}</td>
                                    {examTermIds.map(termId => {
                                        const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                                        const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                                        const max = subjectInfo?.maxMarks || 0;
                                        const obtained = marksInfo?.marksObtained ?? 0;
                                        
                                        subjectRowMax += max;
                                        subjectRowObtained += obtained;

                                        return (
                                            <React.Fragment key={`${termId}-${subjectName}`}>
                                                <td>{max || '-'}</td>
                                                <td>{marksInfo ? obtained : '-'}</td>
                                            </React.Fragment>
                                        )
                                    })}
                                    <td className="font-semibold">{subjectRowMax}</td>
                                    <td className="font-semibold">{subjectRowObtained}</td>
                                </tr>
                            )
                        })}
                        <tr className="font-bold bg-gray-100">
                             <td className="text-left">Total</td>
                             {examTermIds.map(termId => {
                                let termMaxTotal = 0;
                                let termObtainedTotal = 0;
                                uniqueSubjects.forEach(subjectName => {
                                    const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                                    const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                                    termMaxTotal += subjectInfo?.maxMarks || 0;
                                    termObtainedTotal += marksInfo?.marksObtained ?? 0;
                                });
                                return (
                                    <React.Fragment key={`total-${termId}`}>
                                        <td>{termMaxTotal}</td>
                                        <td>{termObtainedTotal}</td>
                                    </React.Fragment>
                                )
                             })}
                             <td>{grandTotal.max}</td>
                             <td>{grandTotal.obtained}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div className="mt-8 grid grid-cols-3 gap-4 text-sm font-semibold">
                    <div>Percentage: <span className="font-bold text-base">{grandTotal.percentage}%</span></div>
                    <div>Grade: <span className="font-bold text-base">{grade}</span></div>
                    <div>Result: <span className="font-bold text-base">{finalResult}</span></div>
                </div>
                
                <div className="mt-16 flex justify-between items-end text-sm">
                    <div>
                        <p className="border-t-2 border-black pt-1">Class Teacher's Signature</p>
                    </div>
                    <div>
                        <p className="border-t-2 border-black pt-1">Principal's Signature</p>
                    </div>
                </div>

            </div>

             <div className="fixed bottom-4 right-4 no-print">
                 <p className="text-xs text-gray-500">You can close this window after printing.</p>
                 <button onClick={() => window.close()} className="mt-2 px-4 py-2 bg-gray-200 rounded">Close</button>
            </div>
        </div>
    );
}

export default function ReportCardPrintPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');
    const examTermIds = searchParams.getAll('examTermId');

    if (!studentId || examTermIds.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">Error: Student ID and at least one Exam Term ID are required to generate a report card.</p>
            </div>
        );
    }
    
    return <ReportCardView schoolId={params.id} studentId={studentId} examTermIds={examTermIds} />;
}
