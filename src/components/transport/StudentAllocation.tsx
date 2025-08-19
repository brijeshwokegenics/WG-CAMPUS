
'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserPlus, Trash2, Search, Edit } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { getStudentsForSchool } from '@/app/actions/academics';
import { getRoutes, getAssignedStudents, assignStudentsToRoute, unassignStudent } from '@/app/actions/transport';
import { EditAssignmentDialog } from './EditAssignmentDialog';


type ClassData = { id: string; name: string; sections: string[]; };
type Route = { id: string; name: string; stops: { name: string; fee: number }[]; };
type Student = { id: string; studentName: string; className: string; section: string; };

export function StudentAllocation({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null);

    const selectedRoute = useMemo(() => routes.find(r => r.id === selectedRouteId), [routes, selectedRouteId]);

    const fetchData = async () => {
        setLoading(true);
        const [routesRes, assignedRes] = await Promise.all([
            getRoutes(schoolId),
            getAssignedStudents(schoolId, selectedRouteId || undefined)
        ]);
        setRoutes(routesRes);
        setAssignedStudents(assignedRes);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [schoolId, selectedRouteId]);
    
    const handleUnassign = (assignmentId: string) => {
        if(confirm("Are you sure you want to unassign this student from the route?")){
            startTransition(() => {
                unassignStudent(assignmentId, schoolId).then(fetchData);
            })
        }
    }
    
    const handleEdit = (assignment: any) => {
        setEditingAssignment(assignment);
        setIsEditOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Assign Students to Routes</CardTitle>
                        <CardDescription>Allocate students to specific transport routes and stops.</CardDescription>
                    </div>
                    {selectedRoute && (
                         <AssignStudentDialog schoolId={schoolId} route={selectedRoute} classes={classes} onSuccess={fetchData}/>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 max-w-sm">
                    <Label>Filter by Route</Label>
                    <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                        <SelectTrigger><SelectValue placeholder="Select a route to view students..." /></SelectTrigger>
                        <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader><TableRow><TableHead>Student Name</TableHead><TableHead>Admission ID</TableHead><TableHead>Class</TableHead><TableHead>Stop</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : assignedStudents.length > 0 ? (
                                assignedStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.studentName}</TableCell>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell>{student.className} - {student.section}</TableCell>
                                        <TableCell>{student.stopName}</TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} disabled={isPending}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleUnassign(student.id)} disabled={isPending}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No students assigned to this route.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {editingAssignment && (
                <EditAssignmentDialog
                    isOpen={isEditOpen}
                    setIsOpen={setIsEditOpen}
                    schoolId={schoolId}
                    assignment={editingAssignment}
                    routes={routes}
                    onSuccess={fetchData}
                />
            )}
        </Card>
    );
}

// Dialog to find and assign students
function AssignStudentDialog({ schoolId, route, classes, onSuccess }: { schoolId: string, route: Route, classes: ClassData[], onSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [classId, setClassId] = useState('');
    const [section, setSection] = useState('');
    const [stopName, setStopName] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
    const [selectAll, setSelectAll] = useState(false);
    const [isPending, startTransition] = useTransition();
    
    const selectedClass = useMemo(() => classes.find(c => c.id === classId), [classes, classId]);

    const handleSearch = async () => {
        if (!classId || !section) {
            setStudents([]);
            return;
        }
        setLoading(true);
        const res = await getStudentsForSchool({ schoolId, classId, section, rowsPerPage: 1000 });
        setStudents(res.students);
        setLoading(false);
    }
    
     useEffect(() => {
        const newSelection: Record<string, boolean> = {};
        if (selectAll) students.forEach(s => newSelection[s.id] = true);
        setSelectedStudents(newSelection);
    }, [selectAll, students]);

    const handleStudentSelect = (studentId: string, isSelected: boolean) => {
        setSelectedStudents(prev => ({ ...prev, [studentId]: isSelected }));
        if (!isSelected) setSelectAll(false);
    };

    const handleAssign = async () => {
        const studentIdsToAssign = Object.entries(selectedStudents).filter(([, isSelected]) => isSelected).map(([id]) => id);
        if(studentIdsToAssign.length === 0 || !stopName) {
            alert("Please select at least one student and a stop.");
            return;
        }
        
        startTransition(async () => {
            const result = await assignStudentsToRoute(schoolId, route.id, stopName, studentIdsToAssign);
            if(result.success) {
                setIsOpen(false);
                onSuccess();
            } else {
                alert(`Error: ${result.error}`);
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4"/> Assign Students</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Assign Students to: {route.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2"><Label>Class</Label><Select value={classId} onValueChange={setClassId}><SelectTrigger><SelectValue placeholder="Select Class"/></SelectTrigger><SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Section</Label><Select value={section} onValueChange={setSection} disabled={!classId}><SelectTrigger><SelectValue placeholder="Select Section"/></SelectTrigger><SelectContent>{selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                    <Button onClick={handleSearch} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>} Search Students</Button>
                </div>
                
                {students.length > 0 && (
                    <div className="mt-4 space-y-4">
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead className="w-12"><Checkbox checked={selectAll} onCheckedChange={setSelectAll}/></TableHead><TableHead>Student Name</TableHead><TableHead>Admission ID</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {students.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell><Checkbox checked={selectedStudents[s.id] || false} onCheckedChange={(checked) => handleStudentSelect(s.id, Boolean(checked))}/></TableCell>
                                            <TableCell>{s.studentName}</TableCell>
                                            <TableCell>{s.id}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign to Stop</Label>
                            <Select value={stopName} onValueChange={setStopName}>
                                <SelectTrigger><SelectValue placeholder="Select a stop..."/></SelectTrigger>
                                <SelectContent>{route.stops.map(s => <SelectItem key={s.name} value={s.name}>{s.name} (₹{s.fee})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={Object.values(selectedStudents).every(v => !v) || !stopName || isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Assign Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
