
'use client';

import React, { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { z } from 'zod';
import { createExamTerm, getExamTerms } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, CalendarRange, Edit, FilePenLine } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';
import { ExamScheduleDialog } from './ExamScheduleDialog';
import { MarksEntrySheet } from './MarksEntrySheet';

type ClassData = { id: string; name: string; sections: string[]; };
type ExamTerm = { id: string; name: string; session: string; };

const ExamTermSchema = z.object({
    name: z.string().min(3, 'Exam name is required'),
    session: z.string().min(4, 'Session is required'),
});

export function ExamManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [terms, setTerms] = useState<ExamTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // State for schedule dialog
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [selectedTermForSchedule, setSelectedTermForSchedule] = useState<ExamTerm | null>(null);

    // State for marks entry sheet
    const [isMarksSheetOpen, setIsMarksSheetOpen] = useState(false);
    const [selectedTermForMarks, setSelectedTermForMarks] = useState<ExamTerm | null>(null);

    const initialState = { success: false, error: null, message: null };
    const [state, formAction] = useFormState(createExamTerm, initialState);

    const fetchTerms = async () => {
        setLoading(true);
        const result = await getExamTerms(schoolId);
        if (result.success && result.data) {
            setTerms(result.data as ExamTerm[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTerms();
    }, [schoolId]);

    useEffect(() => {
        if (state.success) {
            setIsFormOpen(false);
            fetchTerms();
        }
    }, [state]);

    const handleOpenScheduleDialog = (term: ExamTerm) => {
        setSelectedTermForSchedule(term);
        setIsScheduleDialogOpen(true);
    };
    
    const handleOpenMarksSheet = (term: ExamTerm) => {
        setSelectedTermForMarks(term);
        setIsMarksSheetOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Exam Terms</h2>
                <Button onClick={() => setIsFormOpen(!isFormOpen)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isFormOpen ? 'Cancel' : 'Create Exam Term'}
                </Button>
            </div>

            {isFormOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Exam Term</CardTitle>
                        <CardDescription>Define a new examination term for the school.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-4">
                            {state.error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{state.error}</AlertDescription>
                                </Alert>
                            )}
                            <input type="hidden" name="schoolId" value={schoolId} />
                            <div className="space-y-2">
                                <Label htmlFor="name">Exam Name</Label>
                                <Input id="name" name="name" placeholder="e.g., Mid-Term, Final Exam" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="session">Session</Label>
                                <Input id="session" name="session" placeholder="e.g., 2024-2025" defaultValue={`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`} />
                            </div>
                            <Button type="submit">Create Term</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : terms.length === 0 ? (
                <p className="text-muted-foreground text-center">No exam terms created yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {terms.map(term => (
                        <Card key={term.id}>
                            <CardHeader>
                                <CardTitle>{term.name}</CardTitle>
                                <CardDescription>{term.session}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col space-y-2">
                                <Button variant="outline" onClick={() => handleOpenScheduleDialog(term)}>
                                    <CalendarRange className="mr-2 h-4 w-4" /> Manage Schedule
                                </Button>
                                <Button variant="outline" onClick={() => handleOpenMarksSheet(term)}>
                                    <FilePenLine className="mr-2 h-4 w-4" /> Enter Marks
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            {selectedTermForSchedule && (
                <ExamScheduleDialog
                    isOpen={isScheduleDialogOpen}
                    setIsOpen={setIsScheduleDialogOpen}
                    examTerm={selectedTermForSchedule}
                    schoolId={schoolId}
                    classes={classes}
                />
            )}
            
            {selectedTermForMarks && (
                <MarksEntrySheet
                    isOpen={isMarksSheetOpen}
                    setIsOpen={setIsMarksSheetOpen}
                    examTerm={selectedTermForMarks}
                    schoolId={schoolId}
                    classes={classes}
                />
            )}
        </div>
    );
}
