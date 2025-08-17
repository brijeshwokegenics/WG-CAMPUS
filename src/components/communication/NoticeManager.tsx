
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/app/actions/communication';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2, Megaphone, Users, User, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

type Notice = { id: string; title: string; content: string; audience: string[]; postedAt: Date; };
type ClassData = { id: string; name: string; sections: string[]; };

const NoticeSchema = z.object({
  title: z.string().min(3, "Title is required."),
  content: z.string().min(10, "Content is required."),
  audience: z.array(z.string()).min(1, "At least one audience must be selected."),
});
type NoticeFormValues = z.infer<typeof NoticeSchema>;

export function NoticeManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchNotices = async () => {
        setLoading(true);
        const result = await getNotices(schoolId);
        setNotices(result as Notice[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotices();
    }, [schoolId]);

    const handleFormSuccess = () => {
        setIsDialogOpen(false);
        setEditingNotice(null);
        fetchNotices();
    };

    const handleAddNew = () => {
        setEditingNotice(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this notice?')) {
            startTransition(() => {
                deleteNotice(id, schoolId).then(fetchNotices);
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>All Notices</CardTitle>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> New Notice</Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                : notices.length > 0 ? (
                    <div className="space-y-4">
                        {notices.map(notice => (
                            <div key={notice.id} className="border p-4 rounded-lg flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{notice.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notice.content}</p>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span>Posted on {format(notice.postedAt, 'dd MMM, yyyy')} | </span>
                                        <span>Audience: {notice.audience.join(', ')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center flex-shrink-0 ml-4">
                                     <Button variant="outline" size="sm" onClick={() => setViewingNotice(notice)}><Info className="mr-2 h-4 w-4"/>View</Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(notice)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(notice.id)} disabled={isPending}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="text-center p-12 bg-muted/50 rounded-lg">
                        <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No notices yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Click "New Notice" to post an announcement.</p>
                    </div>}
            </CardContent>
            
            <NoticeFormDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} schoolId={schoolId} editingNotice={editingNotice} classes={classes} onSuccess={handleFormSuccess} />
            
            {viewingNotice && <NoticeViewDialog notice={viewingNotice} isOpen={!!viewingNotice} setIsOpen={() => setViewingNotice(null)} />}
        </Card>
    );
}

function NoticeFormDialog({ isOpen, setIsOpen, schoolId, editingNotice, classes, onSuccess }: any) {
    const action = editingNotice ? updateNotice : createNotice;
    const [state, formAction] = useFormState(action, { success: false, error: null });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<NoticeFormValues>({
        resolver: zodResolver(NoticeSchema),
    });

    useEffect(() => {
        if (isOpen) reset(editingNotice || { title: '', content: '', audience: ['All'] });
    }, [isOpen, editingNotice, reset]);

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: NoticeFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingNotice) formData.append('id', editingNotice.id);
        formData.append('title', data.title);
        formData.append('content', data.content);
        data.audience.forEach(aud => formData.append('audience', aud));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>{editingNotice ? 'Edit Notice' : 'Post New Notice'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="space-y-2"><Label>Title</Label><Input {...register('title')} />{errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}</div>
                    <div className="space-y-2"><Label>Content</Label><Textarea {...register('content')} rows={8} />{errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}</div>
                    <div className="space-y-2">
                        <Label>Audience</Label>
                        <Controller name="audience" control={control} render={({ field }) => (
                            <div className="p-3 border rounded-md max-h-48 overflow-y-auto">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2"><Checkbox id="aud-all" value="All" checked={field.value?.includes('All')} onCheckedChange={(checked) => { const newValue = checked ? ['All'] : []; field.onChange(newValue); }} /><Label htmlFor="aud-all" className="font-medium">All</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="aud-teachers" value="Teachers" checked={field.value?.includes('Teachers')} disabled={field.value?.includes('All')} onCheckedChange={(checked) => { const newValue = checked ? [...field.value, 'Teachers'] : field.value.filter(v => v !== 'Teachers'); field.onChange(newValue); }} /><Label htmlFor="aud-teachers">All Teachers</Label></div>
                                    <div className="flex items-center gap-2"><Checkbox id="aud-students" value="Students" checked={field.value?.includes('Students')} disabled={field.value?.includes('All')} onCheckedChange={(checked) => { const newValue = checked ? [...field.value, 'Students'] : field.value.filter(v => v !== 'Students'); field.onChange(newValue); }} /><Label htmlFor="aud-students">All Students</Label></div>
                                    <p className="text-xs text-muted-foreground pt-2">Or select specific classes:</p>
                                    {classes.map((cls: ClassData) => (
                                        <div key={cls.id} className="flex items-center gap-2 ml-4">
                                            <Checkbox id={`aud-${cls.id}`} value={cls.name} checked={field.value?.includes(cls.name)} disabled={field.value?.includes('All')} onCheckedChange={(checked) => { const newValue = checked ? [...field.value, cls.name] : field.value.filter(v => v !== cls.name); field.onChange(newValue); }} /><Label htmlFor={`aud-${cls.id}`}>{cls.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} />
                        {errors.audience && <p className="text-sm text-destructive">{errors.audience.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} {editingNotice ? 'Save Changes' : 'Post Notice'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function NoticeViewDialog({ isOpen, setIsOpen, notice }: { isOpen: boolean, setIsOpen: (open: boolean) => void, notice: Notice }) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{notice.title}</DialogTitle>
                    <DialogDescription>
                        Posted on {format(notice.postedAt, 'dd MMMM, yyyy')}
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 pt-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none max-h-[50vh] overflow-y-auto">
                        <p>{notice.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Audience:</span>
                        <div className="flex flex-wrap gap-2">
                            {notice.audience.map(aud => <Badge key={aud} variant="secondary">{aud}</Badge>)}
                        </div>
                    </div>
                 </div>
                 <DialogFooter>
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
