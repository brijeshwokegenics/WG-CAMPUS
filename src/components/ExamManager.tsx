
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createExamTerm, updateExamTerm, getExamTerms, deleteExamTerm } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, CalendarRange, FilePenLine, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';
import { ExamScheduleDialog } from './ExamScheduleDialog';
import { MarksEntrySheet } from './MarksEntrySheet';

type ClassData = { id: string; name: string; sections: string[]; };
type ExamTerm = { id: string; name: string; session: string; };

const ExamTermFormSchema = z.object({
    name: z.string().min(3, 'Exam name is required'),
    session: z.string().min(4, 'Session is required'),
});

type ExamTermFormValues = z.infer<typeof ExamTermFormSchema>;

export function ExamManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [terms, setTerms] = useState<ExamTerm[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<ExamTerm | null>(null);

    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [selectedTermForSchedule, setSelectedTermForSchedule] = useState<ExamTerm | null>(null);

    const [isMarksSheetOpen, setIsMarksSheetOpen] = useState(false);
    const [selectedTermForMarks, setSelectedTermForMarks] = useState<ExamTerm | null>(null);
    const [isDeleting, startDeleteTransition] = useTransition();
    
    const form = useForm<ExamTermFormValues>({
        resolver: zodResolver(ExamTermFormSchema),
        defaultValues: { name: '', session: '' },
    });

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

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setEditingTerm(null);
        form.reset();
        fetchTerms();
    };

    const handleOpenScheduleDialog = (term: ExamTerm) => {
        setSelectedTermForSchedule(term);
        setIsScheduleDialogOpen(true);
    };

    const handleOpenMarksSheet = (term: ExamTerm) => {
        setSelectedTermForMarks(term);
        setIsMarksSheetOpen(true);
    };

    const handleEditClick = (term: ExamTerm) => {
        setEditingTerm(term);
        form.reset({
            name: term.name,
            session: term.session,
        });
        setIsFormOpen(true);
    };
    
    const handleDeleteClick = (term: ExamTerm) => {
        if (confirm(`Are you sure you want to delete the exam term "${term.name}"? This action cannot be undone.`)) {
            startDeleteTransition(async () => {
                await deleteExamTerm({ examTermId: term.id, schoolId });
                fetchTerms();
            });
        }
    };

    const handleAddNewClick = () => {
        setEditingTerm(null);
        form.reset({
            name: '',
            session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        });
        setIsFormOpen(true);
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setEditingTerm(null);
        form.reset();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Exam Terms</h2>
                {!isFormOpen && (
                    <Button onClick={handleAddNewClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Exam Term
                    </Button>
                )}
            </div>

            {isFormOpen && (
                <ExamTermForm
                    schoolId={schoolId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleCancelForm}
                    editingTerm={editingTerm}
                    form={form}
                />
            )}

            {loading ? (
                <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : terms.length === 0 && !isFormOpen ? (
                <p className="text-muted-foreground text-center py-8">No exam terms created yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {terms.map(term => (
                        <Card key={term.id}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start">
                                    {term.name}
                                    <div className="flex items-center">
                                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClick(term)} disabled={isDeleting}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(term)} disabled={isDeleting}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </CardTitle>
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

// Sub-component for the form to handle create and edit
function ExamTermForm({
    schoolId,
    onSuccess,
    onCancel,
    editingTerm,
    form
}: {
    schoolId: string;
    onSuccess: () => void;
    onCancel: () => void;
    editingTerm: ExamTerm | null;
    form: UseFormReturn<ExamTermFormValues>;
}) {
    const initialState = { success: false, error: null, message: null };
    const action = editingTerm ? updateExamTerm : createExamTerm;
    const [state, formAction] = useFormState(action, initialState);
    
    const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: ExamTermFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingTerm) {
            formData.append('examTermId', editingTerm.id);
        }
        formData.append('name', data.name);
        formData.append('session', data.session);
        formAction(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{editingTerm ? 'Edit Exam Term' : 'Create New Exam Term'}</CardTitle>
                <CardDescription>{editingTerm ? 'Update the details for this exam term.' : 'Define a new examination term for the school.'}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {state.error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{state.error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Exam Name</Label>
                        <Input id="name" {...register('name')} placeholder="e.g., Mid-Term, Final Exam" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="session">Session</Label>
                        <Input id="session" {...register('session')} placeholder="e.g., 2024-2025" />
                        {errors.session && <p className="text-sm text-destructive">{errors.session.message}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTerm ? 'Save Changes' : 'Create Term'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
