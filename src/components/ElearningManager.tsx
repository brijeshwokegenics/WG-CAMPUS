
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Book, FileText, Download, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { FileUpload } from './FileUpload';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ElearningEditDialog } from './ElearningEditDialog';

import { getStudyMaterials, addStudyMaterial, getHomework, addHomework, deleteStudyMaterial, deleteHomework } from '@/app/actions/academics';
import { cn } from '@/lib/utils';

type ClassData = { id: string; name: string; sections: string[]; };

// Schemas
const StudyMaterialFormSchema = z.object({
  classId: z.string().min(1, "Please select a class."),
  section: z.string().min(1, "Please select a section."),
  date: z.date(),
  title: z.string().min(3, "Title is required."),
  description: z.string().optional(),
  fileUrl: z.string().url("A valid file URL is required.").optional().or(z.literal('')),
});

const HomeworkFormSchema = z.object({
  classId: z.string().min(1, "Please select a class."),
  section: z.string().min(1, "Please select a section."),
  date: z.date(),
  submissionDate: z.date(),
  title: z.string().min(3, "Title is required."),
  description: z.string().optional(),
  fileUrl: z.string().url("A valid file URL is required.").optional().or(z.literal('')),
}).refine(data => data.submissionDate >= data.date, {
  message: "Submission date cannot be before the assignment date.",
  path: ["submissionDate"],
});


export function ElearningManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [editingType, setEditingType] = useState<'material' | 'homework' | null>(null);

    const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);
    
    const fetchData = async () => {
        if (selectedClassId && selectedSection) {
            setLoading(true);
            const [materialsRes, homeworkRes] = await Promise.all([
                getStudyMaterials({ schoolId, classId: selectedClassId, section: selectedSection }),
                getHomework({ schoolId, classId: selectedClassId, section: selectedSection })
            ]);
            if (materialsRes.success) setStudyMaterials(materialsRes.data || []);
            if (homeworkRes.success) setHomeworks(homeworkRes.data || []);
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [schoolId, selectedClassId, selectedSection]);

    const handleEdit = (item: any, type: 'material' | 'homework') => {
        setEditingItem(item);
        setEditingType(type);
        setIsEditModalOpen(true);
    };
    
    const handleDelete = async (id: string, type: 'material' | 'homework') => {
        const confirmation = confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`);
        if (!confirmation) return;

        if (type === 'material') {
            await deleteStudyMaterial({ id, schoolId });
        } else {
            await deleteHomework({ id, schoolId });
        }
        fetchData();
    };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Select Class</Label>
          <Select value={selectedClassId} onValueChange={v => { setSelectedClassId(v); setSelectedSection(''); }}>
            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Select Section</Label>
          <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClassId}>
            <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
            <SelectContent>{selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedClassId && selectedSection ? (
        <>
            <Tabs defaultValue="study-material" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="study-material"><Book className="mr-2 h-4 w-4" /> Study Material</TabsTrigger>
                    <TabsTrigger value="homework"><FileText className="mr-2 h-4 w-4" /> Homework</TabsTrigger>
                </TabsList>
                <TabsContent value="study-material">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AddStudyMaterialForm schoolId={schoolId} selectedClassId={selectedClassId} selectedSection={selectedSection} onSuccess={fetchData}/>
                                <ContentList title="Uploaded Study Materials" content={studyMaterials} loading={loading} isHomework={false} onEdit={handleEdit} onDelete={handleDelete} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="homework">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <AddHomeworkForm schoolId={schoolId} selectedClassId={selectedClassId} selectedSection={selectedSection} onSuccess={fetchData}/>
                                <ContentList title="Uploaded Homework" content={homeworks} loading={loading} isHomework={true} onEdit={handleEdit} onDelete={handleDelete} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             {isEditModalOpen && editingItem && editingType && (
                <ElearningEditDialog
                    isOpen={isEditModalOpen}
                    setIsOpen={setIsEditModalOpen}
                    item={editingItem}
                    type={editingType}
                    schoolId={schoolId}
                    classes={classes}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        fetchData();
                    }}
                />
            )}
        </>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Please select a class and section to manage e-learning content.</p>
        </div>
      )}
    </div>
  );
}


// Add Study Material Form
function AddStudyMaterialForm({ schoolId, selectedClassId, selectedSection, onSuccess }: { schoolId: string, selectedClassId: string, selectedSection: string, onSuccess: () => void }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        resolver: zodResolver(StudyMaterialFormSchema),
        defaultValues: { classId: selectedClassId, section: selectedSection, date: new Date(), title: '', description: '', fileUrl: '' }
    });
    
    const [state, formAction] = useFormState(addStudyMaterial, { success: false });

    useEffect(() => {
        if(state.success) {
            reset({ classId: selectedClassId, section: selectedSection, date: new Date(), title: '', description: '', fileUrl: '' });
            onSuccess();
        }
    }, [state.success, reset, onSuccess, selectedClassId, selectedSection]);

    const onFormSubmit = (data: any) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (value instanceof Date) formData.append(key, value.toISOString());
            else formData.append(key, value);
        });
        formAction(formData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <h3 className="text-lg font-medium">Add New Study Material</h3>
             {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
            <Input type="hidden" {...register("classId")} />
            <Input type="hidden" {...register("section")} />
            
            <div className="space-y-2">
                <Label>Date</Label>
                <Controller name="date" control={control} render={({ field }) => (
                    <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                )} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="title_sm">Title</Label>
                <Input id="title_sm" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description_sm">Description (Optional)</Label>
                <Textarea id="description_sm" {...register("description")} />
            </div>
            <div className="space-y-2">
                <FileUpload
                    id="fileUrl_sm"
                    label="Attach File (Optional)"
                    uploadPath={`/${schoolId}/study_materials`}
                    onUploadComplete={(url) => setValue('fileUrl', url, { shouldValidate: true })}
                    onFileRemove={() => setValue('fileUrl', '', { shouldValidate: true })}
                />
                {errors.fileUrl && <p className="text-sm text-destructive">{errors.fileUrl.message as string}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Material
            </Button>
        </form>
    );
}

// Add Homework Form
function AddHomeworkForm({ schoolId, selectedClassId, selectedSection, onSuccess }: { schoolId: string, selectedClassId: string, selectedSection: string, onSuccess: () => void }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue } = useForm({
        resolver: zodResolver(HomeworkFormSchema),
        defaultValues: { classId: selectedClassId, section: selectedSection, date: new Date(), submissionDate: new Date(), title: '', description: '', fileUrl: '' }
    });
    
     const [state, formAction] = useFormState(addHomework, { success: false });

    useEffect(() => {
        if(state.success) {
            reset({ classId: selectedClassId, section: selectedSection, date: new Date(), submissionDate: new Date(), title: '', description: '', fileUrl: '' });
            onSuccess();
        }
    }, [state.success, reset, onSuccess, selectedClassId, selectedSection]);

    const onFormSubmit = (data: any) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (value instanceof Date) formData.append(key, value.toISOString());
            else formData.append(key, value);
        });
        formAction(formData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <h3 className="text-lg font-medium">Add New Homework</h3>
            {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}

            <Input type="hidden" {...register("classId")} />
            <Input type="hidden" {...register("section")} />
            
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Assignment Date</Label>
                    <Controller name="date" control={control} render={({ field }) => (
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                    )} />
                </div>
                <div className="space-y-2">
                    <Label>Submission Date</Label>
                    <Controller name="submissionDate" control={control} render={({ field }) => (
                        <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                    )} />
                </div>
            </div>
             {errors.submissionDate && <p className="text-sm text-destructive">{errors.submissionDate.message as string}</p>}
            <div className="space-y-2">
                <Label htmlFor="title_hw">Title</Label>
                <Input id="title_hw" {...register("title")} />
                 {errors.title && <p className="text-sm text-destructive">{errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="description_hw">Description (Optional)</Label>
                <Textarea id="description_hw" {...register("description")} />
            </div>
             <div className="space-y-2">
                <FileUpload
                    id="fileUrl_hw"
                    label="Attach File (Optional)"
                    uploadPath={`/${schoolId}/homework`}
                    onUploadComplete={(url) => setValue('fileUrl', url, { shouldValidate: true })}
                    onFileRemove={() => setValue('fileUrl', '', { shouldValidate: true })}
                />
                 {errors.fileUrl && <p className="text-sm text-destructive">{errors.fileUrl.message as string}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Homework
            </Button>
        </form>
    );
}

// Content List Component
function ContentList({ title, content, loading, isHomework, onEdit, onDelete }: { title: string, content: any[], loading: boolean, isHomework: boolean, onEdit: (item: any, type: 'material' | 'homework') => void, onDelete: (id: string, type: 'material' | 'homework') => void }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">{title}</h3>
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : content.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No content found.</p>
                </div>
            ) : (
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                {isHomework && <TableHead>Submission</TableHead>}
                                <TableHead>File</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {content.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{format(item.date, 'dd-MMM-yy')}</TableCell>
                                    {isHomework && <TableCell>{format(item.submissionDate, 'dd-MMM-yy')}</TableCell>}
                                    <TableCell>
                                        {item.fileUrl ? (
                                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm"><Download className="mr-2 h-3 w-3"/>View</Button>
                                            </a>
                                        ) : (
                                            <span className='text-xs text-muted-foreground'>No file</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(item, isHomework ? 'homework' : 'material')}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(item.id, isHomework ? 'homework' : 'material')} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
