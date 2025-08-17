
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
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
import { Loader2, Search, CalendarIcon, Printer, RefreshCcw, User, UserCog, UserSquare2, PlusCircle, Trash2, Edit, Ticket } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStudentsForSchool } from '@/app/actions/academics';
import * as actions from '@/app/actions/gatepass';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getUsersForSchool } from '@/app/actions/users';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogContent, DialogTrigger, DialogDescription } from './ui/dialog';

type Member = { id: string; name: string; type: 'Student' | 'Staff'; details: string; };
type PassType = { id: string; name: string; };

export function GatePassManager({ schoolId }: { schoolId: string }) {
    const [recentPasses, setRecentPasses] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
    const [isManageTypesDialogOpen, setIsManageTypesDialogOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoadingData(true);
        const passesRes = await actions.getRecentGatePasses(schoolId);
        if (passesRes.success) setRecentPasses(passesRes.data);
        setLoadingData(false);
    }, [schoolId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSuccess = () => {
        setIsIssueDialogOpen(false);
        setIsManageTypesDialogOpen(false);
        fetchData();
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle>Gate Pass Records</CardTitle>
                        <CardDescription>A log of all recently issued passes.</CardDescription>
                    </div>
                    <div className='flex items-center gap-2'>
                         <Button variant="outline" onClick={() => setIsManageTypesDialogOpen(true)}>Manage Pass Types</Button>
                         <Button onClick={() => setIsIssueDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Issue New Pass</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <RecentPassesTable schoolId={schoolId} passes={recentPasses} loading={loadingData} refresh={fetchData} />
            </CardContent>
             {isIssueDialogOpen && <IssuePassDialog isOpen={isIssueDialogOpen} setIsOpen={setIsIssueDialogOpen} schoolId={schoolId} onSuccess={handleSuccess} />}
            {isManageTypesDialogOpen && <ManagePassTypesDialog isOpen={isManageTypesDialogOpen} setIsOpen={setIsManageTypesDialogOpen} schoolId={schoolId} onSuccess={handleSuccess} />}
        </Card>
    );
}

function RecentPassesTable({ schoolId, passes, loading, refresh }: { schoolId: string, passes: any[], loading: boolean, refresh: () => void }) {
    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (passId: string, status: 'Returned' | 'Expired') => {
        startTransition(async () => {
            await actions.updateGatePassStatus(schoolId, passId, status);
            refresh();
        });
    };
    
    const handlePrint = (passId: string) => {
        window.open(`/director/dashboard/${schoolId}/admin/gate-pass/print?id=${passId}`, '_blank');
    };

    return (
        <div className="border rounded-lg max-h-[70vh] overflow-y-auto relative">
             <div className="absolute top-2 right-2">
                <Button variant="outline" size="sm" onClick={refresh} disabled={loading}><RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")}/> Refresh</Button>
            </div>
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
    )
}

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
  session: z.string().optional(),
  passDuration: z.string().optional(),
});

type GatePassFormValues = z.infer<typeof GatePassFormSchema>;


function IssuePassDialog({ isOpen, setIsOpen, schoolId, onSuccess }: {isOpen: boolean, setIsOpen: (open: boolean) => void, schoolId: string, onSuccess: () => void}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [isSearching, startSearchTransition] = useTransition();
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    
    const [durationValue, setDurationValue] = useState(1);
    const [durationUnit, setDurationUnit] = useState('Days');

    const [state, formAction] = useFormState(actions.createGatePass, { success: false });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<GatePassFormValues>({
        resolver: zodResolver(GatePassFormSchema),
        defaultValues: { 
            passDate: new Date(), 
            outTime: format(new Date(), 'HH:mm'), 
            memberType: 'Student',
            session: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
        }
    });
    
    const memberType = watch('memberType');
    
    useEffect(() => {
        async function fetchTypes() {
            const typesRes = await actions.getPassTypes(schoolId);
            setPassTypes(typesRes as PassType[]);
        }
        if(isOpen) fetchTypes();
    }, [isOpen, schoolId]);

    useEffect(() => {
        if(state.success){
            reset();
            onSuccess();
        }
    }, [state.success, reset, onSuccess]);

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
        const combinedDuration = `${durationValue} ${durationUnit}`;
        
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]) => {
             if (key === 'passDuration') {
                 formData.append('passDuration', combinedDuration);
             } else if (value instanceof Date) {
                 formData.append(key, value.toISOString());
             } else if (value) {
                 formData.append(key, value as string);
             }
        });
        formAction(formData);
    };

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                 <DialogHeader>
                    <DialogTitle>Issue New Pass</DialogTitle>
                </DialogHeader>
                 <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4 max-h-[80vh] overflow-y-auto pr-2">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Pass Type</Label>
                            <Controller name="passType" control={control} render={({field}) => (
                                <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder="Select a pass type..."/></SelectTrigger><SelectContent>{passTypes.map(type => <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>)}</SelectContent></Select>
                            )} />
                            {errors.passType && <p className="text-sm text-destructive">{errors.passType.message}</p>}
                        </div>
                        <div className="space-y-2"><Label>Session</Label><Input {...register('session')} placeholder="e.g., 2024-2025"/></div>
                    </div>
                     <div className="space-y-2">
                        <Label>Pass Duration</Label>
                        <div className='flex items-center gap-2'>
                           <Input type="number" value={durationValue} onChange={e => setDurationValue(Number(e.target.value))} className="w-24" min="1"/>
                           <Select value={durationUnit} onValueChange={setDurationUnit}>
                               <SelectTrigger><SelectValue/></SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="Days">Days</SelectItem>
                                   <SelectItem value="Months">Months</SelectItem>
                                   <SelectItem value="Year">Year</SelectItem>
                               </SelectContent>
                           </Select>
                           <Input type="hidden" {...register('passDuration')} />
                        </div>
                    </div>
                    <div className="space-y-2"><Label>Reason for Pass</Label><Textarea {...register('reason')} />{errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Date</Label><Controller name="passDate" control={control} render={({ field }) => (<Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start"><CalendarIcon className="mr-2 h-4 w-4"/>{field.value ? format(field.value, "PPP") : 'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange}/></PopoverContent></Popover>)} /></div>
                        <div className="space-y-2"><Label>Out Time</Label><Input type="time" {...register('outTime')}/>{errors.outTime && <p className="text-sm text-destructive">{errors.outTime.message}</p>}</div>
                    </div>
                    <div className="space-y-2"><Label>Issued By (Staff Name)</Label><Input {...register('issuedBy')} />{errors.issuedBy && <p className="text-sm text-destructive">{errors.issuedBy.message}</p>}</div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !watch('passHolderName')}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Issue Pass</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function ManagePassTypesDialog({ isOpen, setIsOpen, schoolId, onSuccess }: { isOpen: boolean; setIsOpen: (open: boolean) => void; schoolId: string, onSuccess: () => void }) {
    const [passTypes, setPassTypes] = useState<PassType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingType, setEditingType] = useState<PassType | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const fetchPassTypes = useCallback(async () => {
        setLoading(true);
        const typesRes = await actions.getPassTypes(schoolId);
        setPassTypes(typesRes as PassType[]);
        setLoading(false);
    }, [schoolId]);

    useEffect(() => {
        if(isOpen) fetchPassTypes();
    }, [isOpen, fetchPassTypes]);

    const handleDelete = (id: string) => {
        if(confirm("Are you sure you want to delete this pass type?")) {
            startTransition(async () => {
                await actions.deletePassType(id, schoolId);
                fetchPassTypes();
            });
        }
    }
    
    const handleEdit = (type: PassType) => {
        setEditingType(type);
        setIsFormOpen(true);
    }
    
    const handleAdd = () => {
        setEditingType(null);
        setIsFormOpen(true);
    }
    
    const handleFormSuccess = () => {
        setIsFormOpen(false);
        fetchPassTypes();
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Pass Types</DialogTitle>
                    <DialogDescription>Add, edit, or remove available pass types.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                     <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add New Type</Button>
                    </div>

                    {isFormOpen && <PassTypeForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} schoolId={schoolId} editingType={editingType} onSuccess={handleFormSuccess} />}

                     <div className="border rounded-lg max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pass Type Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? <TableRow><TableCell colSpan={2}><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow> 
                                : passTypes.length > 0 ? passTypes.map(type => (
                                    <TableRow key={type.id}>
                                        <TableCell className="font-medium">{type.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(type)} disabled={isPending}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(type.id)} disabled={isPending}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={2} className="h-24 text-center">No pass types created.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const PassTypeFormSchema = z.object({
  name: z.string().min(3, "Name is required"),
});
type PassTypeFormValues = z.infer<typeof PassTypeFormSchema>;

function PassTypeForm({ isOpen, setIsOpen, schoolId, editingType, onSuccess }: { isOpen: boolean; setIsOpen: (open: boolean) => void; schoolId: string, editingType: PassType | null, onSuccess: () => void }) {
    const action = editingType ? actions.updatePassType : actions.createPassType;
    const [state, formAction] = useFormState(action, { success: false, error: null });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PassTypeFormValues>({
        resolver: zodResolver(PassTypeFormSchema),
        defaultValues: { name: editingType?.name || '' }
    });

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);
    
    useEffect(() => {
        reset({ name: editingType?.name || '' });
    }, [editingType, reset]);

    const onFormSubmit = (data: PassTypeFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('name', data.name);
        if (editingType) {
            formData.append('id', editingType.id);
        }
        formAction(formData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className='p-4 border rounded-lg space-y-4 bg-muted/50'>
             <h4 className="font-semibold">{editingType ? 'Edit Pass Type' : 'Add New Pass Type'}</h4>
            {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
            <div className="space-y-2">
                <Label htmlFor="pass-type-name">Pass Type Name</Label>
                <Input id="pass-type-name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
             <div className="flex justify-end gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    {editingType ? 'Save Changes' : 'Create'}
                </Button>
            </div>
        </form>
    )
}
