
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { sendMessage, getSentMessages } from '@/app/actions/communication';
import { getStudentsForSchool } from '@/app/actions/academics';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, Send, Users, User, Trash2, Info, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type ClassData = { id: string; name: string; sections: string[]; };
type UserData = { id: string; name: string; role: string; };

const MessageFormSchema = z.object({
  recipientType: z.enum(['all_students', 'all_staff', 'class', 'individual_student', 'individual_staff']),
  classId: z.string().optional(),
  section: z.string().optional(),
  individualId: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty."),
});
type MessageFormValues = z.infer<typeof MessageFormSchema>;

export function MessagingManager({ schoolId, classes, users }: { schoolId: string, classes: ClassData[], users: UserData[] }) {
    const [sentMessages, setSentMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchMessages() {
            setLoading(true);
            const res = await getSentMessages(schoolId);
            if (res.success) {
                setSentMessages(res.data || []);
            }
            setLoading(false);
        }
        fetchMessages();
    }, [schoolId]);

    const handleSuccess = () => {
         getSentMessages(schoolId).then(res => {
            if (res.success) setSentMessages(res.data || []);
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <ComposeMessageForm schoolId={schoolId} classes={classes} users={users} onSuccess={handleSuccess} />
            </div>
            <div className="lg:col-span-2">
                <SentMessagesList messages={sentMessages} loading={loading} />
            </div>
        </div>
    );
}

function ComposeMessageForm({ schoolId, classes, users, onSuccess }: { schoolId: string, classes: ClassData[], users: UserData[], onSuccess: () => void }) {
    const [state, formAction] = useFormState(sendMessage, { success: false, error: null });
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<MessageFormValues>({
        resolver: zodResolver(MessageFormSchema),
        defaultValues: { recipientType: 'all_students' }
    });
    
    const recipientType = watch('recipientType');
    const classId = watch('classId');
    const selectedClass = useMemo(() => classes.find(c => c.id === classId), [classes, classId]);
    
    const [students, setStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (state.success) {
            reset();
            onSuccess();
        }
    }, [state.success, reset, onSuccess]);
    
    useEffect(() => {
        const fetchClassStudents = async () => {
            if(recipientType === 'individual_student' && classId) {
                setLoadingStudents(true);
                const res = await getStudentsForSchool({schoolId, classId});
                setStudents(res);
                setLoadingStudents(false);
            } else {
                setStudents([]);
            }
        }
        fetchClassStudents();
    }, [recipientType, classId, schoolId]);


    const onFormSubmit = async (data: MessageFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('content', data.content);

        let recipients: string[] = [];
        let description = '';

        switch(data.recipientType) {
            case 'all_students':
                recipients = ['all_students'];
                description = 'All Students';
                break;
            case 'all_staff':
                recipients = ['all_staff'];
                description = 'All Staff';
                break;
            case 'class':
                if(data.classId && data.section) {
                    recipients = [`class_${data.classId}_${data.section}`];
                    const className = classes.find(c => c.id === data.classId)?.name;
                    description = `Class ${className} - ${data.section}`;
                }
                break;
            case 'individual_student':
                if(data.individualId) {
                    recipients = [`student_${data.individualId}`];
                    description = `Student: ${students.find(s => s.id === data.individualId)?.studentName}`;
                }
                break;
            case 'individual_staff':
                 if(data.individualId) {
                    recipients = [`staff_${data.individualId}`];
                    description = `Staff: ${users.find(u => u.id === data.individualId)?.name}`;
                }
                break;
        }

        recipients.forEach(r => formData.append('recipients', r));
        formData.append('recipientDescription', description);
        
        formAction(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>Send a one-way message or announcement.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    {state.message && state.success && <Alert className="border-green-500 text-green-700"><AlertDescription>{state.message}</AlertDescription></Alert>}

                    <div className="space-y-2">
                        <Label>Recipient</Label>
                        <Controller name="recipientType" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all_students">All Students</SelectItem>
                                    <SelectItem value="all_staff">All Staff</SelectItem>
                                    <SelectItem value="class">A Specific Class</SelectItem>
                                    <SelectItem value="individual_student">An Individual Student</SelectItem>
                                    <SelectItem value="individual_staff">An Individual Staff Member</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                    </div>

                    {recipientType === 'class' && (
                        <div className="grid grid-cols-2 gap-2">
                            <Controller name="classId" control={control} render={({ field }) => (<Select onValueChange={v => { field.onChange(v); setValue('section', '')}} value={field.value}><SelectTrigger><SelectValue placeholder="Class..."/></SelectTrigger><SelectContent>{classes.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>)} />
                            <Controller name="section" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value} disabled={!classId}><SelectTrigger><SelectValue placeholder="Section..."/></SelectTrigger><SelectContent>{selectedClass?.sections.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>)} />
                        </div>
                    )}
                    
                    {recipientType === 'individual_student' && (
                        <>
                            <Controller name="classId" control={control} render={({ field }) => (<Select onValueChange={v => { field.onChange(v); setValue('individualId', '')}} value={field.value}><SelectTrigger><SelectValue placeholder="Select class to find student..."/></SelectTrigger><SelectContent>{classes.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>)} />
                            <Controller name="individualId" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value} disabled={!classId}><SelectTrigger><SelectValue placeholder={loadingStudents ? "Loading..." : "Select student..."}/></SelectTrigger><SelectContent>{students.map(s=><SelectItem key={s.id} value={s.id}>{s.studentName}</SelectItem>)}</SelectContent></Select>)} />
                        </>
                    )}
                    
                    {recipientType === 'individual_staff' && (
                        <Controller name="individualId" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select staff member..."/></SelectTrigger><SelectContent>{users.map(u=><SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>)}</SelectContent></Select>)} />
                    )}

                    <div className="space-y-2">
                        <Label>Message Content</Label>
                        <Textarea {...register('content')} rows={5} />
                        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="whatsapp-toggle" disabled />
                        <Label htmlFor="whatsapp-toggle">Also send via WhatsApp</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Enable this in Admin &gt; Integrations</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Send Message
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function SentMessagesList({ messages, loading }: { messages: any[], loading: boolean }) {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Sent Messages</CardTitle>
                <CardDescription>A log of your recent communications.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-4 pr-4">
                        {loading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        : messages.length === 0 ? <p className="text-sm text-center text-muted-foreground p-8">No messages sent yet.</p>
                        : messages.map(msg => (
                            <div key={msg.id} className="border p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-sm">To: <Badge variant="secondary">{msg.recipientDescription}</Badge></p>
                                    <p className="text-xs text-muted-foreground">{format(msg.sentAt, 'dd MMM, hh:mm a')}</p>
                                </div>
                                <p className="mt-2 text-sm">{msg.content}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
         </Card>
    );
}
