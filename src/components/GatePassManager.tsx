
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { format } from 'date-fns';
import { useDebouncedCallback } from 'use-debounce';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, CalendarIcon, Printer, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStudentsForSchool } from '@/app/actions/academics';
import { createGatePass, getRecentGatePasses, updateGatePassStatus } from '@/app/actions/gatepass';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { getUsersForSchool } from '@/app/actions/users';

type Member = { id: string; name: string; type: 'Student' | 'Staff'; details: string; };

const PassTypes = z.enum([
    "Hall Pass", "Library Pass", "Laboratory Pass",
    "Late Arrival Pass", "Early Dismissal Pass", "Gate Pass",
    "Medical/Clinic Pass", "Vehicle Pass"
]);

const GatePassFormSchema = z.object({
  studentId: z.string().optional(),
  memberType: z.enum(['Student', 'Staff', 'Visitor']).optional(),
  passHolderName: z.string().optional(),
  passHolderDetails: z.string().optional(),
  passType: PassTypes,
  passDate: z.date(),
  reason: z.string().min(5, "A valid reason is required."),
  issuedBy: z.string().min(1, "Issuer name is required."),
  outTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid HH:MM time."),
});

type GatePassFormValues = z.infer<typeof GatePassFormSchema>;

export function GatePassManager({ schoolId }: { schoolId: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [isSearching, startSearchTransition] = useTransition();
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const [loadingPasses, setLoadingPasses] = useState(true);
    const [issueForVisitor, setIssueForVisitor] = useState(false);

    const [state, formAction] = useFormState(createGatePass, { success: false });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<GatePassFormValues>({
        resolver: zodResolver(GatePassFormSchema),
        defaultValues: { passDate: new Date(), outTime: format(new Date(), 'HH:mm'), passType: "Gate Pass" }
    });

    const fetchPasses = async () => {
        setLoadingPasses(true);
        const result = await getRecentGatePasses(schoolId);
        if (result.success) setRecentPasses(result.data);
        setLoadingPasses(false);
    };

    useEffect(() => {
        fetchPasses();
    }, [schoolId]);

    useEffect(() => {
        if(state.success){
            reset({ passDate: new Date(), outTime: format(new Date(), 'HH:mm'), passType: "Gate Pass", passHolderName: '', passHolderDetails: '' });
            setSelectedMember(null);
            setIssueForVisitor(false);
            fetchPasses();
        }
    }, [state.success, reset]);

    const debouncedSearch = useDebouncedCallback((term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        startSearchTransition(async () => {
            const [studentRes, staffRes] = await Promise.all([
                getStudentsForSchool({ schoolId, searchTerm: term }),
                getUsersForSchool(schoolId, term)
            ]);

            const students: Member[] = (studentRes || []).map((s: any) => ({
                id: s.id,
                name: s.studentName,
                type: 'Student',
                details: `${s.className} - ${s.section}`
            }));
            const staff: Member[] = (staffRes.data || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                type: 'Staff',
                details: s.role
            }));
            setSearchResults([...students, ...staff]);
        });
    }, 500);

    const handleSelectMember = (member: Member) => {
        setSelectedMember(member);
        setValue('studentId', member.id);
        setValue('memberType', member.type);
        setSearchTerm('');
        setSearchResults([]);
    };
    
    const onFormSubmit = (data: GatePassFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]) => {
             if (value instanceof Date) formData.append(key, value.toISOString());
             else if (value) formData.append(key, value as string);
        });
        formAction(formData);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Issue New Pass</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                            {state.message && (
                                <Alert variant={state.success ? 'default' : 'destructive'}>
                                    {state.success ? <CheckCircle2 className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                                    <AlertTitle>{state.success ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>{state.message || state.error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch id="visitor-mode" checked={issueForVisitor} onCheckedChange={(checked) => {
                                    setIssueForVisitor(checked);
                                    setSelectedMember(null);
                                    setValue('studentId', '');
                                    setValue('memberType', checked ? 'Visitor' : undefined);
                                }} />
                                <Label htmlFor="visitor-mode">Issue Pass for Visitor / Other</Label>
                            </div>

                            {issueForVisitor ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Pass Holder Name</Label>
                                        <Input {...register('passHolderName')} placeholder="e.g., John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Details / Relation</Label>
                                        <Input {...register('passHolderDetails')} placeholder="e.g., Parent of Jane Doe, Class 5" />
                                    </div>
                                </>
                            ) : (
                                 <div className="space-y-2">
                                    <Label>Search Student or Staff</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search by name or ID..." className="pl-8" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); debouncedSearch(e.target.value);}}/>
                                    </div>
                                    {isSearching && <Loader2 className="animate-spin mx-auto"/>}
                                    {searchResults.length > 0 && (
                                        <div className="border rounded-md max-h-40 overflow-y-auto"><ul>{searchResults.map(s => <li key={`${s.type}-${s.id}`} className="p-2 cursor-pointer hover:bg-muted" onClick={() => handleSelectMember(s)}>{s.name} <Badge variant="secondary">{s.type}</Badge></li>)}</ul></div>
                                    )}
                                     {selectedMember && (
                                        <div className="p-2 bg-green-50 border border-green-200 rounded-md text-sm">
                                            Selected: <span className="font-semibold">{selectedMember.name}</span> <Badge variant="outline">{selectedMember.type}</Badge>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Pass Type</Label>
                                <Controller name="passType" control={control} render={({field}) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {PassTypes.options.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>

                            <div className="space-y-2">
                                <Label>Reason for Pass</Label>
                                <Textarea {...register('reason')} />
                                {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Controller name="passDate" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, "PPP") : 'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover>)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Out Time</Label>
                                    <Input type="time" {...register('outTime')}/>
                                    {errors.outTime && <p className="text-sm text-destructive">{errors.outTime.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Issued By (Staff Name)</Label>
                                <Input {...register('issuedBy')} />
                                {errors.issuedBy && <p className="text-sm text-destructive">{errors.issuedBy.message}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting || (!selectedMember && !watch('passHolderName'))}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Issue Pass
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <RecentPassesTable schoolId={schoolId} passes={recentPasses} loading={loadingPasses} refresh={fetchPasses} />
            </div>
        </div>
    );
}

function RecentPassesTable({ schoolId, passes, loading, refresh }: { schoolId: string, passes: any[], loading: boolean, refresh: () => void }) {
    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (passId: string, status: 'Returned' | 'Expired') => {
        startTransition(async () => {
            await updateGatePassStatus(schoolId, passId, status);
            refresh();
        });
    };
    
    const handlePrint = (passId: string) => {
        window.open(`/director/dashboard/${schoolId}/admin/gate-pass/print?id=${passId}`, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Recently Issued Passes</CardTitle>
                    <Button variant="outline" size="sm" onClick={refresh} disabled={loading}><RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")}/> Refresh</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[70vh] overflow-y-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>Pass Holder</TableHead><TableHead>Pass Type</TableHead><TableHead>Out Time</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
                            : passes.length > 0 ? passes.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.studentName}</TableCell>
                                    <TableCell>{p.passType}</TableCell>
                                    <TableCell>{p.outTime}</TableCell>
                                    <TableCell>
                                        <Badge variant={p.status === 'Issued' ? 'destructive' : (p.status === 'Returned' ? 'default' : 'secondary')}>{p.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {p.status === 'Issued' && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(p.id, 'Returned')} disabled={isPending}>Mark Returned</Button>}
                                        <Button size="icon" variant="ghost" onClick={() => handlePrint(p.id)}><Printer className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            : <TableRow><TableCell colSpan={5} className="h-24 text-center">No recent gate passes found.</TableCell></TableRow>
                            }
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
