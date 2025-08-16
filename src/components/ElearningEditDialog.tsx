
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { FileUpload } from './FileUpload';
import { Alert, AlertDescription } from './ui/alert';
import { cn } from '@/lib/utils';
import { updateStudyMaterial, updateHomework } from '@/app/actions/academics';

type ClassData = { id: string; name: string; sections: string[]; };

const commonSchema = {
    id: z.string(),
    classId: z.string().min(1, "Please select a class."),
    section: z.string().min(1, "Please select a section."),
    date: z.date(),
    title: z.string().min(3, "Title is required."),
    description: z.string().optional(),
    fileUrl: z.string().url("A valid file URL is required.").optional().or(z.literal('')),
};

const UpdateStudyMaterialFormSchema = z.object(commonSchema);
const UpdateHomeworkFormSchema = z.object({
    ...commonSchema,
    submissionDate: z.date(),
}).refine(data => data.submissionDate >= data.date, {
  message: "Submission date cannot be before the assignment date.",
  path: ["submissionDate"],
});


interface ElearningEditDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    item: any;
    type: 'material' | 'homework';
    schoolId: string;
    classes: ClassData[];
    onSuccess: () => void;
}

export function ElearningEditDialog({ isOpen, setIsOpen, item, type, schoolId, classes, onSuccess }: ElearningEditDialogProps) {
    const isHomework = type === 'homework';
    const schema = isHomework ? UpdateHomeworkFormSchema : UpdateStudyMaterialFormSchema;
    
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, setValue, watch } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { ...item, fileUrl: item.fileUrl || '' }
    });
    
    const action = isHomework ? updateHomework : updateStudyMaterial;
    const [state, formAction] = useFormState(action, { success: false, error: null });
    
    const watchedClassId = watch("classId");
    const selectedClass = React.useMemo(() => classes.find(c => c.id === watchedClassId), [classes, watchedClassId]);

    useEffect(() => {
        if(state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: any) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (value instanceof Date) formData.append(key, value.toISOString());
            else if(value !== null && value !== undefined) formData.append(key, value);
        });
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit {isHomework ? 'Homework' : 'Study Material'}</DialogTitle>
                    <DialogDescription>Update the details for this item.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <input type="hidden" {...register("id")} />

                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label>Class</Label>
                             <Controller name="classId" control={control} render={({ field }) => (
                                <Select onValueChange={(v) => {field.onChange(v); setValue('section', '')}} defaultValue={field.value}>
                                  <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                              )} />
                            {errors.classId && <p className="text-sm text-destructive">{errors.classId.message as string}</p>}
                          </div>
                          <div className="space-y-2">
                             <Label>Section</Label>
                             <Controller name="section" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClass}>
                                  <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                                  <SelectContent>{selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                             )} />
                            {errors.section && <p className="text-sm text-destructive">{errors.section.message as string}</p>}
                          </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{isHomework ? 'Assignment Date' : 'Date'}</Label>
                            <Controller name="date" control={control} render={({ field }) => (
                                <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                            )} />
                        </div>
                        {isHomework && (
                             <div className="space-y-2">
                                <Label>Submission Date</Label>
                                <Controller name="submissionDate" control={control} render={({ field }) => (
                                    <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                                )} />
                            </div>
                        )}
                    </div>
                     {errors.submissionDate && <p className="text-sm text-destructive">{errors.submissionDate.message as string}</p>}

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input {...register("title")} />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message as string}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea {...register("description")} />
                    </div>
                    <div className="space-y-2">
                        <FileUpload
                            id="editFileUrl"
                            label="Attach File (Optional)"
                            uploadPath={`/${schoolId}/${isHomework ? 'homework' : 'study_materials'}`}
                            onUploadComplete={(url) => setValue('fileUrl', url, { shouldValidate: true })}
                            onFileRemove={() => setValue('fileUrl', '', { shouldValidate: true })}
                            initialUrl={item.fileUrl}
                        />
                        {errors.fileUrl && <p className="text-sm text-destructive">{errors.fileUrl.message as string}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
