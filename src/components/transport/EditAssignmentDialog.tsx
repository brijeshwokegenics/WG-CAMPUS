
'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { updateStudentAssignment } from '@/app/actions/transport';

type Route = { id: string; name: string; stops: { name: string; fee: number }[]; };

interface EditAssignmentDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    schoolId: string;
    assignment: any;
    routes: Route[];
    onSuccess: () => void;
}

export function EditAssignmentDialog({ isOpen, setIsOpen, schoolId, assignment, routes, onSuccess }: EditAssignmentDialogProps) {
    const [newRouteId, setNewRouteId] = useState(assignment.routeId);
    const [newStopName, setNewStopName] = useState(assignment.stopName);
    const [isPending, startTransition] = useTransition();

    const selectedRoute = useMemo(() => routes.find(r => r.id === newRouteId), [routes, newRouteId]);

    // Reset stop when route changes
    useEffect(() => {
        if (newRouteId !== assignment.routeId) {
            setNewStopName('');
        } else {
            setNewStopName(assignment.stopName);
        }
    }, [newRouteId, assignment.routeId, assignment.stopName]);

    const handleSubmit = () => {
        if (!newRouteId || !newStopName) {
            alert("Please select a route and a stop.");
            return;
        }

        startTransition(async () => {
            const result = await updateStudentAssignment(schoolId, assignment.id, newRouteId, newStopName);
            if (result.success) {
                onSuccess();
                setIsOpen(false);
            } else {
                alert(`Error: ${result.error}`);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Transport for: {assignment.studentName}</DialogTitle>
                    <DialogDescription>
                        Change the assigned route or stop for this student.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Route</Label>
                        <Select value={newRouteId} onValueChange={setNewRouteId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a new route" />
                            </SelectTrigger>
                            <SelectContent>
                                {routes.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Stop</Label>
                        <Select value={newStopName} onValueChange={setNewStopName} disabled={!selectedRoute}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a new stop" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectedRoute?.stops.map(s => (
                                    <SelectItem key={s.name} value={s.name}>{s.name} (₹{s.fee})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending || !newStopName}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
