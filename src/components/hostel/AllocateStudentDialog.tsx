
'use client';

import React, { useState, useTransition } from 'react';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import { assignStudentToRoom } from '@/app/actions/hostel';
import { getStudentsForSchool } from '@/app/actions/academics';
import { useDebouncedCallback } from 'use-debounce';
import { Alert, AlertDescription } from '../ui/alert';

export function AllocateStudentDialog({ isOpen, setIsOpen, schoolId, hostel, room, onSuccess }: any) {
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [isSearching, startSearchTransition] = useTransition();

    const [state, formAction] = useFormState(assignStudentToRoom, { success: false, error: null });
    
    const debouncedSearch = useDebouncedCallback(async (term) => {
        if (term.length < 3) {
            setStudents([]);
            return;
        }
        startSearchTransition(async () => {
            const result = await getStudentsForSchool({ schoolId, searchTerm: term });
            setStudents(result);
        });
    }, 500);

    const handleSubmit = () => {
        if (!selectedStudent) {
            alert("Please select a student.");
            return;
        }
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('hostelId', hostel.id);
        formData.append('roomId', room.id);
        formData.append('studentId', selectedStudent.id);
        formAction(formData);
    };

    React.useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state.success, onSuccess]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setSearchTerm('');
                setStudents([]);
                setSelectedStudent(null);
            }
            setIsOpen(open);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Allocate Student to Room {room.roomNumber}</DialogTitle>
                    <DialogDescription>
                        Search for a student to assign them to this room in {hostel.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search student by name or ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                debouncedSearch(e.target.value);
                            }}
                        />
                    </div>
                    {isSearching && <Loader2 className="animate-spin mx-auto"/>}
                    {students.length > 0 && (
                        <div className="border rounded-md max-h-60 overflow-y-auto">
                            <ul>
                                {students.map(s => (
                                    <li key={s.id} 
                                        className={`p-2 cursor-pointer hover:bg-muted ${selectedStudent?.id === s.id ? 'bg-muted' : ''}`}
                                        onClick={() => setSelectedStudent(s)}
                                    >
                                        <p className="font-medium">{s.studentName}</p>
                                        <p className="text-xs text-muted-foreground">ID: {s.id} | Class: {s.className} {s.section}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                     {selectedStudent && (
                        <div className="p-2 bg-green-50 border border-green-200 rounded-md text-sm">
                            Selected: <span className="font-semibold">{selectedStudent.studentName}</span>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!selectedStudent || state.success}>
                        {state.success ? 'Assigned!' : 'Assign Student'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
