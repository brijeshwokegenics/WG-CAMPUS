
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
import { Loader2, Search, CalendarIcon, Printer, RefreshCcw, User, UserCog, UserSquare2, PlusCircle, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStudentsForSchool } from '@/app/actions/academics';
import { createGatePass, getRecentGatePasses, updateGatePassStatus, getPassTypes, createPassType, deletePassType } from '@/app/actions/gatepass';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getUsersForSchool } from '@/app/actions/users';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogContent, DialogTrigger } from './ui/dialog';

type Member = { id: string; name: string; type: 'Student' | 'Staff'; details: string; };
type PassType = { id: string; name: string; };

const GatePassFormSchema = z.object({
  passHolderId: z.string().optional(),
  memberType: z.enum(['Student', 'Staff', 'Visitor']),
  passHolderName: z.string().min(1, "Pass holder name is required."),
  passHolderDetails: z.string().optional(),
  passType: z.string().min(1, "Please select a pass type."),
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
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    
    const [state, formAction] = useFormState(createGatePass, { success: false });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<GatePassFormValues>({
        resolver: zodResolver(GatePassFormSchema),
        defaultValues: { passDate: new Date(), outTime: format(new Date(), 'HH:mm'), memberType: 'Student' }
    });
    
    const memberType = watch('memberType');

    const fetchData = async () => {
        setLoadingData(true);
        const [passesRes, typesRes] = await Promise.all([
            getRecentGatePasses(schoolId),
            getPassTypes(schoolId)
        ]);
        if (passesRes.success) setRecentPasses(passesRes.data);
        setPassTypes(typesRes as PassType[]);
        setLoadingData(false);
    };

    useEffect(() => {
        fetchData();
    }, [schoolId]);

    useEffect(() => {
        if(state.success){
            reset({ passDate: new Date(), outTime: format(new Date(), 'HH:mm'), passType: undefined, memberType: 'Student', passHolderName: '', passHolderDetails: '' });
            setSelectedMember(null);
            fetchData();
        }
    }, [state.success, reset]);

    const debouncedSearch = useDebouncedCallback(async (term) => {
        if (term.length < 2) {
            setSearchResults([]);
            return;
        }
        startSearchTransition(async () => {
            let results: Member[] = [];
            if (memberType === 'Student') {
                const studentRes = await getStudentsForSchool({ schoolId, searchTerm: term });
                results = (studentRes || []).map((s: any) => ({ id: s.id, name: s.studentName, type: 'Student', details: `${s.className} - ${s.section}` }));
            } else if (memberType === 'Staff') {
                const staffRes = await getUsersForSchool(schoolId, term);
                 results = (staffRes.data || []).map((s: any) => ({ id: s.id, name: s.name, type: 'Staff', details: s.role }));
            }
            setSearchResults(results);
        });
    }, 500);
    
    useEffect(() => {
        // Reset search when member type changes
        setSearchTerm('');
        setSearchResults([]);
        setSelectedMember(null);
        setValue('passHolderId', undefined);
        setValue('passHolderName', '');
        setValue('passHolderDetails', '');
    }, [memberType, setValue]);

    const handleSelectMember = (member: Member) => {
        setSelectedMember(member);
        setValue('passHolderId', member.id);
        setValue('passHolderName', member.name);
        setValue('passHolderDetails', member.details);
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
                    <CardHeader><CardTitle>Issue New Pass</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                            {state.error && (<Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>)}
                            
                            <Controller name="memberType" control={control} render={({field}) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-4">
                                    <div><RadioGroupItem value="Student" id="Student"/><Label htmlFor="Student" className="ml-2 flex items-center gap-2"><User className="h-4 w-4"/>Student</Label></div>
                                    <div><RadioGroupItem value="Staff" id="Staff"/><Label htmlFor="Staff" className="ml-2 flex items-center gap-2"><UserCog className="h-4 w-4"/>Staff</Label></div>
                                    <div><RadioGroupItem value="Visitor" id="Visitor"/><Label htmlFor="Visitor" className="ml-2 flex items-center gap-2"><UserSquare2 className="h-4 w-4"/>Visitor</Label></div>
                                </RadioGroup>
                            )}/>
                            
                            {memberType === 'Visitor' ? (
                                <>
                                    <div className="space-y-2"><Label>Visitor Name</Label><Input {...register('passHolderName')} /></div>
                                    <div className="space-y-2"><Label>Details / Relation</Label><Input {...register('passHolderDetails')} /></div>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Search {memberType}</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder={`Search ${memberType.toLowerCase()} by name or ID...`} className="pl-8" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); debouncedSearch(e.target.value);}}/>
                                    </div>
                                    {isSearching && <Loader2 className="animate-spin mx-auto"/>}
                                    {searchResults.length > 0 && (<div className="border rounded-md max-h-40 overflow-y-auto"><ul>{searchResults.map(s => <li key={`${s.type}-${s.id}`} className="p-2 cursor-pointer hover:bg-muted" onClick={() => handleSelectMember(s)}>{s.name} <Badge variant="secondary">{s.details}</Badge></li>)}</ul></div>)}
                                    {selectedMember && (<div className="p-2 bg-green-50 border border-green-200 rounded-md text-sm">Selected: <span className="font-semibold">{selectedMember.name}</span></div>)}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Pass Type</Label>
                                <Controller name="passType" control={control} render={({field}) => (
                                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select a pass type..."/></SelectTrigger><SelectContent>{passTypes.map(type => <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>)}</SelectContent></Select>
                                )} />
                                {errors.passType && <p className="text-sm text-destructive">{errors.passType.message}</p>}
                            </div>

                            <div className="space-y-2"><Label>Reason for Pass</Label><Textarea {...register('reason')} />{errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Date</Label><Controller name="passDate" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, "PPP") : 'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover>)} /></div>
                                <div className="space-y-2"><Label>Out Time</Label><Input type="time" {...register('outTime')}/>{errors.outTime && <p className="text-sm text-destructive">{errors.outTime.message}</p>}</div>
                            </div>
                            <div className="space-y-2"><Label>Issued By (Staff Name)</Label><Input {...register('issuedBy')} />{errors.issuedBy && <p className="text-sm text-destructive">{errors.issuedBy.message}</p>}</div>
                            <Button type="submit" className="w-full" disabled={isSubmitting || !watch('passHolderName')}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Issue Pass</Button>
                        </form>
                    </CardContent>
                </Card>
                <ManagePassTypes schoolId={schoolId} passTypes={passTypes} refresh={fetchData} />
            </div>
            <div className="lg:col-span-2">
                <RecentPassesTable schoolId={schoolId} passes={recentPasses} loading={loadingData} refresh={fetchData} />
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
                                    <TableCell className="font-medium">{p.passHolderName} <Badge variant="secondary">{p.memberType}</Badge></TableCell>
                                    <TableCell>{p.passType}</TableCell>
                                    <TableCell>{p.outTime}</TableCell>
                                    <TableCell><Badge variant={p.status === 'Issued' ? 'destructive' : (p.status === 'Returned' ? 'default' : 'secondary')}>{p.status}</Badge></TableCell>
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

function ManagePassTypes({ schoolId, passTypes, refresh }: { schoolId: string, passTypes: PassType[], refresh: () => void }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        if(confirm("Are you sure you want to delete this pass type?")) {
            startTransition(async () => {
                await deletePassType(id, schoolId);
                refresh();
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Pass Types</CardTitle>
                <CardDescription>Add or remove available pass types.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {passTypes.map(type => (
                        <div key={type.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <p className="text-sm font-medium">{type.name}</p>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(type.id)} disabled={isPending}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                <AddPassTypeDialog schoolId={schoolId} refresh={refresh} />
            </CardContent>
        </Card>
    )
}

function AddPassTypeDialog({ schoolId, refresh }: { schoolId: string, refresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction] = useFormState(createPassType, { success: false, error: null });
    const [name, setName] = useState('');

    useEffect(() => {
        if (state.success) {
            setIsOpen(false);
            setName('');
            refresh();
        }
    }, [state.success, refresh]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Add New Pass Type</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Pass Type</DialogTitle>
                </DialogHeader>
                <form action={formAction}>
                    <div className="space-y-4 py-4">
                        {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                        <input type="hidden" name="schoolId" value={schoolId} />
                        <div className="space-y-2">
                            <Label htmlFor="pass-type-name">Pass Type Name</Label>
                            <Input id="pass-type-name" name="name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
