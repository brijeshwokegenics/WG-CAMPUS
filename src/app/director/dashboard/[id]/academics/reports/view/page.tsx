
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStudentById, getMarksForStudent, getExamSchedule, getExamTerms } from '@/app/actions/academics';
import { getSchool } from '@/app/actions/school';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

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
        return Array.from(subjectSet).sort();
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
                subjectTotalObtained += (marksInfo?.marksObtained !== undefined && marksInfo?.marksObtained !== null) ? marksInfo.marksObtained : 0;
            });
            
            totalMaxMarks += subjectTotalMax;
            totalMarksObtained += subjectTotalObtained;
            
            if (subjectTotalMax > 0 && (subjectTotalObtained / subjectTotalMax) * 100 < PASS_PERCENTAGE) {
                isFail = true;
            }
        });

        const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
        
        let calculatedGrade = 'F';
        if (percentage >= 90) calculatedGrade = 'A+';
        else if (percentage >= 80) calculatedGrade = 'A';
        else if (percentage >= 70) calculatedGrade = 'B';
        else if (percentage >= 60) calculatedGrade = 'C';
        else if (percentage >= 50) calculatedGrade = 'D';
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
         <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
            <style type="text/css" media="print">
              {`
                @page { size: A4; margin: 0; }
                body { -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
                .report-card-container {
                    margin: 0;
                    box-shadow: none;
                    border: none;
                    border-radius: 0;
                    min-height: 100vh;
                 }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
              `}
            </style>
            
            <div className="report-card-container w-full max-w-4xl bg-white shadow-2xl rounded-lg font-sans">
                <div className="p-8 border-4 border-blue-900 rounded-lg min-h-[29.7cm]">
                    <div className="text-center mb-6 border-b-4 border-double border-blue-900 pb-4">
                        <h1 className="text-4xl font-bold uppercase text-blue-900 tracking-wider">{school.schoolName}</h1>
                        <p className="text-sm text-gray-600 mt-1">{school.address}, {school.city}, {school.state} - {school.zipcode}</p>
                        <p className="text-sm text-gray-600">Phone: {school.phone} | Email: {school.contactEmail}</p>
                        <h2 className="text-2xl font-semibold mt-4 text-blue-800 bg-blue-100 py-1 rounded-md">ACADEMIC REPORT CARD</h2>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <p><strong>Student Name:</strong> <span className='font-semibold text-base'>{student.studentName}</span></p>
                        <p><strong>Admission ID:</strong> {studentId}</p>
                        <p><strong>Class & Section:</strong> {student.className} - {student.section}</p>
                        <p><strong>Date of Birth:</strong> {format(student.dob, 'PPP')}</p>
                        <p><strong>Father's Name:</strong> {student.fatherName}</p>
                        <p><strong>Session:</strong> {examTerms[0]?.session || ''}</p>
                    </div>

                    <table className="w-full border-collapse border border-gray-400 text-sm">
                        <thead className="bg-blue-100 text-blue-900">
                            <tr>
                                <th rowSpan={2} className="border border-gray-400 p-2 font-semibold">Subjects</th>
                                {examTerms.map(term => (
                                    <th key={term.id} colSpan={2} className="border border-gray-400 p-2 font-semibold">{term.name}</th>
                                ))}
                                <th colSpan={3} className="border border-gray-400 p-2 font-semibold bg-blue-200">Grand Total</th>
                            </tr>
                            <tr>
                                {examTermIds.map(termId => (
                                    <React.Fragment key={termId}>
                                        <th className="border border-gray-400 p-2 font-medium">Max</th>
                                        <th className="border border-gray-400 p-2 font-medium">Obt.</th>
                                    </React.Fragment>
                                ))}
                                <th className="border border-gray-400 p-2 font-medium bg-blue-200">Max</th>
                                <th className="border border-gray-400 p-2 font-medium bg-blue-200">Obt.</th>
                                <th className="border border-gray-400 p-2 font-medium bg-blue-200">Pass/Fail</th>
                            </tr>
                        </thead>
                        <tbody>
                        {uniqueSubjects.map(subjectName => {
                                let subjectRowMax = 0;
                                let subjectRowObtained = 0;
                                let subjectPassed = true;

                                examTermIds.forEach(termId => {
                                    const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                                    const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                                    const max = subjectInfo?.maxMarks || 0;
                                    const obtained = (marksInfo?.marksObtained !== undefined && marksInfo?.marksObtained !== null) ? marksInfo.marksObtained : 0;
                                    
                                    if (max > 0 && (obtained / max) * 100 < 33) {
                                        subjectPassed = false;
                                    }
                                });

                                return (
                                    <tr key={subjectName} className="text-center even:bg-gray-50">
                                        <td className="border border-gray-400 p-2 text-left font-semibold">{subjectName}</td>
                                        {examTermIds.map(termId => {
                                            const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                                            const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                                            const max = subjectInfo?.maxMarks || 0;
                                            const obtained = (marksInfo?.marksObtained !== undefined && marksInfo?.marksObtained !== null) ? marksInfo.marksObtained : marksInfo;
                                            
                                            subjectRowMax += max;
                                            if (obtained) subjectRowObtained += obtained;

                                            return (
                                                <React.Fragment key={`${termId}-${subjectName}`}>
                                                    <td className="border border-gray-400 p-2">{max || '-'}</td>
                                                    <td className={`border border-gray-400 p-2 font-medium ${max > 0 && obtained !== undefined && (obtained/max * 100 < 33) ? 'text-red-600' : ''}`}>
                                                        {obtained !== undefined ? obtained : '-'}
                                                    </td>
                                                </React.Fragment>
                                            )
                                        })}
                                        <td className="border border-gray-400 p-2 font-semibold bg-blue-50">{subjectRowMax}</td>
                                        <td className="border border-gray-400 p-2 font-semibold bg-blue-50">{subjectRowObtained}</td>
                                        <td className={`border border-gray-400 p-2 font-semibold bg-blue-50 ${subjectPassed ? 'text-green-600' : 'text-red-600'}`}>
                                            {subjectPassed ? 'P' : 'F'}
                                        </td>
                                    </tr>
                                )
                            })}
                            <tr className="font-bold bg-blue-100 text-blue-900 text-center">
                                <td className="border border-gray-400 p-2 text-left">Total</td>
                                {examTermIds.map(termId => {
                                    let termMaxTotal = 0;
                                    let termObtainedTotal = 0;
                                    uniqueSubjects.forEach(subjectName => {
                                        const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                                        const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                                        termMaxTotal += subjectInfo?.maxMarks || 0;
                                        termObtainedTotal += (marksInfo?.marksObtained !== undefined && marksInfo?.marksObtained !== null) ? marksInfo.marksObtained : 0;
                                    });
                                    return (
                                        <React.Fragment key={`total-${termId}`}>
                                            <td className="border border-gray-400 p-2">{termMaxTotal}</td>
                                            <td className="border border-gray-400 p-2">{termObtainedTotal}</td>
                                        </React.Fragment>
                                    )
                                })}
                                <td className="border border-gray-400 p-2 bg-blue-200">{grandTotal.max}</td>
                                <td className="border border-gray-400 p-2 bg-blue-200">{grandTotal.obtained}</td>
                                <td className="border border-gray-400 p-2 bg-blue-200"></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center rounded-lg bg-blue-100 p-4">
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Percentage</p>
                            <p className="font-bold text-xl text-blue-800">{grandTotal.percentage}%</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Grade</p>
                            <p className="font-bold text-xl text-blue-800">{grade}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Result</p>
                            <p className={`font-bold text-xl ${finalResult === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>{finalResult}</p>
                        </div>
                    </div>
                    
                    <div className="mt-12 pt-8 flex justify-between items-end text-sm">
                        <div>
                            <p className="border-t-2 border-gray-400 pt-1 px-8">Class Teacher's Signature</p>
                        </div>
                        <div>
                            <p className="border-t-2 border-gray-400 pt-1 px-8">Principal's Signature</p>
                        </div>
                    </div>
                </div>
            </div>

             <div className="fixed bottom-4 right-4 no-print space-x-2">
                 <Button onClick={() => window.print()}>Print</Button>
                 <Button variant="outline" onClick={() => window.close()}>Close</Button>
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

    