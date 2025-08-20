

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

function getGrade(percentage: number): string {
    if (percentage > 90) return 'A1';
    if (percentage > 80) return 'A2';
    if (percentage > 70) return 'B1';
    if (percentage > 60) return 'B2';
    if (percentage > 50) return 'C1';
    if (percentage > 40) return 'C2';
    if (percentage >= 33) return 'D';
    return 'E';
}

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

    const finalCoScholasticAndRemarks = useMemo(() => {
        // Find the final term among the selected ones.
        const finalTerm = examTerms.find(term => term.isFinalTerm);
        const termIdForCoScholastic = finalTerm ? finalTerm.id : examTermIds[examTermIds.length - 1];
        
        if (termIdForCoScholastic && allMarks[termIdForCoScholastic]) {
            const finalTermMarks = allMarks[termIdForCoScholastic];
            return {
                workEducationGrade: finalTermMarks.workEducationGrade || '',
                artEducationGrade: finalTermMarks.artEducationGrade || '',
                healthEducationGrade: finalTermMarks.healthEducationGrade || '',
                disciplineGrade: finalTermMarks.disciplineGrade || '',
                remarks: finalTermMarks.remarks || '',
            };
        }
        return {
            workEducationGrade: '', artEducationGrade: '', healthEducationGrade: '',
            disciplineGrade: '', remarks: ''
        };
    }, [allMarks, examTerms, examTermIds]);

    const { grandTotal, finalResult, grade, isFail } = useMemo(() => {
        let totalMaxMarks = 0;
        let totalMarksObtained = 0;
        let failInSubject = false;
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
                failInSubject = true;
            }
        });

        const overallPercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
        
        return {
            grandTotal: {
                max: totalMaxMarks,
                obtained: totalMarksObtained,
                percentage: overallPercentage.toFixed(2)
            },
            finalResult: failInSubject ? 'NEEDS IMPROVEMENT' : 'PASS',
            grade: getGrade(overallPercentage),
            isFail: failInSubject,
        };

    }, [uniqueSubjects, allSubjects, allMarks, examTermIds]);


    if (loading) {
        return <div className="p-8 text-center flex items-center justify-center min-h-screen"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Report Card...</div>;
    }

    if (!student || !school) {
        return <div className="p-8 text-center">Could not load student or school data.</div>;
    }

    return (
         <>
            <style type="text/css" media="print">
              {`
                @page { 
                    size: A4; 
                    margin: 15mm; 
                }
                body { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important;
                    font-family: 'Times New Roman', Times, serif; 
                }
                .report-card-container {
                    box-shadow: none !important;
                    border: 2px solid #000 !important;
                }
                .print-hidden {
                    display: none;
                }
                .scholastic-header {
                    background-color: #E5E7EB !important;
                }
                th, td {
                    border: 1px solid #000;
                }
              `}
            </style>
            
            <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="report-card-container w-full max-w-4xl bg-white shadow-2xl border-2 border-black">
                    <div className="p-6">
                        <header className="flex items-center justify-between border-b-2 border-black pb-4">
                             <img src={school.schoolLogoUrl || 'https://placehold.co/100x100.png'} alt="School Logo" className="h-20 w-20" />
                             <div className="text-center">
                                <h1 className="text-3xl font-bold uppercase">{school.schoolName}</h1>
                                <p className="text-sm">{school.address}, {school.city}, {school.state}</p>
                                <p className="font-bold mt-2 text-xl">REPORT BOOK</p>
                                <p className="font-semibold">SESSION: {examTerms[0]?.session || ''}</p>
                             </div>
                             <img src={student.photoUrl || 'https://placehold.co/80x100.png'} alt="Student Photo" className="h-24 w-20 border object-cover" />
                        </header>

                        <section className="mt-4 text-sm">
                            <table className="w-full">
                                <tbody>
                                    <tr className="border-none">
                                        <td className="border-none p-1"><strong>Student's Name:</strong></td>
                                        <td className="border-none p-1 font-semibold">{student.studentName}</td>
                                        <td className="border-none p-1"><strong>Class:</strong></td>
                                        <td className="border-none p-1 font-semibold">{student.className} - {student.section}</td>
                                    </tr>
                                    <tr className="border-none">
                                        <td className="border-none p-1"><strong>Father's Name:</strong></td>
                                        <td className="border-none p-1 font-semibold">{student.fatherName}</td>
                                        <td className="border-none p-1"><strong>Admission No:</strong></td>
                                        <td className="border-none p-1 font-semibold">{studentId}</td>
                                    </tr>
                                    <tr className="border-none">
                                        <td className="border-none p-1"><strong>Mother's Name:</strong></td>
                                        <td className="border-none p-1 font-semibold">{student.motherName}</td>
                                        <td className="border-none p-1"><strong>Date of Birth:</strong></td>
                                        <td className="border-none p-1 font-semibold">{format(student.dob, 'dd-MM-yyyy')}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <section className="mt-4">
                            <h2 className="text-center font-bold text-lg mb-2 bg-gray-200 py-1">PART 1: SCHOLASTIC AREAS</h2>
                            <table className="w-full border-collapse text-sm">
                                <thead className="scholastic-header text-center">
                                    <tr>
                                        <th rowSpan={2} className="w-1/4 p-2">Subjects</th>
                                        {examTerms.map(term => <th key={term.id} colSpan={2} className="p-2">{term.name}</th>)}
                                        <th colSpan={3} className="p-2">Final Result</th>
                                    </tr>
                                    <tr>
                                        {examTermIds.map(termId => (
                                            <React.Fragment key={termId}>
                                                <th className="p-1">Marks Obt.</th>
                                                <th className="p-1">Max Marks</th>
                                            </React.Fragment>
                                        ))}
                                        <th className="p-1">Marks Obt.</th>
                                        <th className="p-1">Max Marks</th>
                                        <th className="p-1">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {uniqueSubjects.map(subjectName => {
                                    let subjectTotalObtained = 0;
                                    let subjectTotalMax = 0;
                                    return (
                                        <tr key={subjectName} className="text-center">
                                            <td className="text-left font-semibold p-1">{subjectName}</td>
                                            {examTermIds.map(termId => {
                                                const subjectInfo = allSubjects[termId]?.find(s => s.subjectName === subjectName);
                                                const marksInfo = allMarks[termId]?.marks.find((m: any) => m.subjectName === subjectName);
                                                const obtained = (marksInfo?.marksObtained !== undefined && marksInfo?.marksObtained !== null) ? marksInfo.marksObtained : 0;
                                                const max = subjectInfo?.maxMarks || 0;
                                                subjectTotalObtained += obtained;
                                                subjectTotalMax += max;
                                                return (
                                                    <React.Fragment key={`${termId}-${subjectName}`}>
                                                        <td className="p-1">{obtained || '-'}</td>
                                                        <td className="p-1">{max || '-'}</td>
                                                    </React.Fragment>
                                                )
                                            })}
                                            <td className="font-semibold p-1">{subjectTotalObtained}</td>
                                            <td className="font-semibold p-1">{subjectTotalMax}</td>
                                            <td className="font-semibold p-1">{getGrade((subjectTotalObtained/subjectTotalMax) * 100)}</td>
                                        </tr>
                                    )
                                })}
                                 <tr className="font-bold text-center bg-gray-100">
                                     <td colSpan={1 + (examTerms.length * 2)} className="p-2">GRAND TOTAL</td>
                                     <td className="p-2">{grandTotal.obtained}</td>
                                     <td className="p-2">{grandTotal.max}</td>
                                     <td className="p-2">{grade}</td>
                                 </tr>
                                </tbody>
                            </table>
                        </section>
                        
                        <section className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <h2 className="text-center font-bold text-lg mb-2 bg-gray-200 py-1">PART 2: CO-SCHOLASTIC</h2>
                                <table className="w-full border-collapse text-sm">
                                    <thead className="scholastic-header text-center">
                                        <tr><th className="p-1">Activity</th><th className="p-1">Grade</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center"><td className="p-1 text-left">Work Education</td><td>{finalCoScholasticAndRemarks.workEducationGrade}</td></tr>
                                        <tr className="text-center"><td className="p-1 text-left">Art Education</td><td>{finalCoScholasticAndRemarks.artEducationGrade}</td></tr>
                                        <tr className="text-center"><td className="p-1 text-left">Health & Physical Education</td><td>{finalCoScholasticAndRemarks.healthEducationGrade}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                             <div>
                                <h2 className="text-center font-bold text-lg mb-2 bg-gray-200 py-1">PART 3: DISCIPLINE</h2>
                                <table className="w-full border-collapse text-sm">
                                    <thead className="scholastic-header text-center">
                                        <tr><th className="p-1">Trait</th><th className="p-1">Grade</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center"><td className="p-1 text-left">Discipline</td><td>{finalCoScholasticAndRemarks.disciplineGrade}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mt-4 border-t-2 border-black pt-4 text-sm">
                            <table className="w-full">
                                <tbody>
                                    <tr className="border-none">
                                        <td className="border-none p-1 w-40"><strong>Class Teacher's Remarks:</strong></td>
                                        <td className="border-none p-1 border-b border-dotted border-black w-full">{finalCoScholasticAndRemarks.remarks}</td>
                                    </tr>
                                    <tr className="border-none">
                                        <td className="border-none p-1"><strong>Result:</strong> <span className="font-bold">{finalResult}</span></td>
                                        <td className="border-none p-1"><strong>Percentage:</strong> <span className="font-bold">{grandTotal.percentage}%</span></td>
                                    </tr>
                                     <tr className="border-none">
                                        <td colSpan={2} className="border-none p-1"><strong>Promoted to Class:</strong> <span className="font-bold">{isFail ? '-----' : student.className.replace(/\d+/, (n: any) => parseInt(n)+1)}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                        
                        <footer className="mt-16 flex justify-between items-end text-sm">
                             <div><p>Date: {format(new Date(), 'dd-MM-yyyy')}</p></div>
                             <div><p className="border-t-2 border-dotted border-black pt-1 px-8">Class Teacher</p></div>
                             <div><p className="border-t-2 border-dotted border-black pt-1 px-8">Principal</p></div>
                        </footer>

                    </div>
                </div>

                <div className="fixed bottom-4 right-4 space-x-2 print-hidden">
                    <Button onClick={() => window.print()}>Print</Button>
                    <Button variant="outline" onClick={() => window.close()}>Close</Button>
                </div>
            </div>
        </>
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
