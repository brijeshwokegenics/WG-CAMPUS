
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DayPicker, Matcher } from 'react-day-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, PlusCircle, Edit, Trash2, Loader2, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createEvent, updateEvent, deleteEvent } from '@/app/actions/communication';

type Event = { id: string; title: string; start: Date; end: Date; allDay: boolean; type: 'Holiday' | 'Event' | 'Exam' | 'Other'; description?: string; };

const EventSchema = z.object({
  title: z.string().min(3, "Event title is required."),
  start: z.date(),
  end: z.date(),
  allDay: z.boolean().default(true),
  type: z.enum(['Holiday', 'Event', 'Exam', 'Other']).default('Event'),
  description: z.string().optional(),
}).refine(data => data.end >= data.start, { message: "End date must be on or after start date.", path: ["end"] });
type FormValues = z.infer<typeof EventSchema>;

const eventColors: Record<string, string> = {
    Holiday: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200',
    Event: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
    Exam: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200',
    Other: 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200',
};

const DayContent = (props: any & { events: Event[] }) => {
    const dayEvents = props.events.filter(e => props.date >= e.start && props.date <= e.end);
    return (
        <div className="relative h-full w-full">
            <time>{props.date.getDate()}</time>
            <div className="absolute bottom-1 w-full flex justify-center gap-0.5">
                {dayEvents.slice(0, 3).map(e => (
                    <Dot key={e.id} className={cn("h-4 w-4", eventColors[e.type])} />
                ))}
            </div>
        </div>
    );
};


export function CalendarManager({ schoolId, initialEvents }: { schoolId: string, initialEvents: Event[] }) {
    const [month, setMonth] = useState<Date | undefined>(undefined);
    const [events, setEvents] = useState(initialEvents);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    useEffect(() => {
        setMonth(new Date());
    }, []);

    const handleFormSuccess = (newEvent: Event, isUpdate: boolean) => {
        setIsDialogOpen(false);
        setEditingEvent(null);
        if (isUpdate) {
            setEvents(events.map(e => e.id === newEvent.id ? newEvent : e));
        } else {
            setEvents([...events, newEvent]);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            const result = await deleteEvent(id, schoolId);
            if(result.success) {
                setEvents(events.filter(e => e.id !== id));
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    }

    const eventMatchers: Matcher[] = events.map(event => ({ from: event.start, to: event.end }));
    
    if(!month) {
        return (
            <Card>
                <CardHeader><CardTitle>Loading Calendar...</CardTitle></CardHeader>
                <CardContent className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>School Events</CardTitle>
                    <Button onClick={() => { setEditingEvent(null); setIsDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Add Event</Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 border rounded-md p-2">
                    <DayPicker
                        month={month}
                        onMonthChange={setMonth}
                        modifiers={{ events: eventMatchers }}
                        modifiersClassNames={{ events: 'bg-primary/10' }}
                        components={{
                            DayContent: (props) => <DayContent {...props} events={events} />
                        }}
                        className="w-full"
                    />
                </div>
                <div className="md:col-span-1 space-y-4">
                    <h3 className="font-semibold text-lg">{format(month, 'MMMM yyyy')} Events</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {events.filter(e => e.start.getMonth() === month.getMonth()).sort((a,b) => a.start.getTime() - b.start.getTime()).map(event => (
                             <div key={event.id} className={cn("p-3 rounded-lg border-l-4", eventColors[event.type].replace('bg-', 'border-').replace('dark:bg-','dark:border-'))}>
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold">{event.title}</p>
                                    <div className="flex">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingEvent(event); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{format(event.start, 'dd MMM')} - {format(event.end, 'dd MMM')}</p>
                                {event.description && <p className="text-xs mt-1">{event.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <EventFormDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} schoolId={schoolId} editingEvent={editingEvent} onSuccess={handleFormSuccess} />
        </Card>
    );
}

function EventFormDialog({ isOpen, setIsOpen, schoolId, editingEvent, onSuccess }: any) {
    const action = editingEvent ? updateEvent : createEvent;
    const [state, formAction] = useFormState(action, { success: false, error: null });
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<FormValues>({ resolver: zodResolver(EventSchema) });

    useEffect(() => {
        if (isOpen) reset(editingEvent || { title: '', start: new Date(), end: new Date(), allDay: true, type: 'Event', description: '' });
    }, [isOpen, editingEvent, reset]);

    useEffect(() => {
        if (state.success) {
            const newEvent = { ...(editingEvent || {}), ...watch(), id: editingEvent?.id || Date.now().toString() };
            onSuccess(newEvent, !!editingEvent);
        }
    }, [state.success, onSuccess, watch, editingEvent]);

    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingEvent) formData.append('id', editingEvent.id);
        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof Date) formData.append(key, value.toISOString());
            else formData.append(key, String(value));
        });
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="space-y-2"><Label>Title</Label><Input {...register('title')} />{errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Start Date</Label><Controller name="start" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className="w-full"><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>)} /></div>
                        <div className="space-y-2"><Label>End Date</Label><Controller name="end" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className="w-full"><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, 'PPP') : 'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>)} /></div>
                        {errors.end && <p className="text-sm text-destructive col-span-2">{errors.end.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2"><Label>Type</Label><Controller name="type" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Event">Event</SelectItem><SelectItem value="Holiday">Holiday</SelectItem><SelectItem value="Exam">Exam</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>)} /></div>
                         <div className="flex items-center space-x-2 pt-6"><Controller name="allDay" control={control} render={({ field }) => (<Checkbox id="allDay" checked={field.value} onCheckedChange={field.onChange} />)} /><Label htmlFor="allDay">All Day Event</Label></div>
                    </div>
                    <div className="space-y-2"><Label>Description (Optional)</Label><Textarea {...register('description')} /></div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{editingEvent ? 'Save Changes' : 'Create Event'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
