
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import * as actions from '@/app/actions/hostel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, Hotel, BedDouble, UserPlus } from 'lucide-react';
import { HostelDialog } from './HostelDialog';
import { RoomDialog } from './RoomDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AllocateStudentDialog } from './AllocateStudentDialog';

type Hostel = { id: string; name: string; type: string; warden?: string; };
type Room = { id: string; roomNumber: string; roomType: string; capacity: number; currentOccupancy: number; };

export function HostelManager({ schoolId }: { schoolId: string }) {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
    const [loadingHostels, setLoadingHostels] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [isHostelDialogOpen, setIsHostelDialogOpen] = useState(false);
    const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const fetchHostels = async () => {
        setLoadingHostels(true);
        const result = await actions.getHostels(schoolId);
        setHostels(result as Hostel[]);
        setLoadingHostels(false);
        if (selectedHostel && !result.some(h => h.id === selectedHostel.id)) {
            setSelectedHostel(null);
            setRooms([]);
        }
    };
    
    const fetchRooms = useCallback(async () => {
        if (selectedHostel) {
            setLoadingRooms(true);
            const result = await actions.getRooms(schoolId, selectedHostel.id);
            setRooms(result as Room[]);
            setLoadingRooms(false);
        }
    }, [selectedHostel, schoolId]);


    useEffect(() => {
        fetchHostels();
    }, [schoolId]);

    useEffect(() => {
        fetchRooms();
    }, [selectedHostel, schoolId, fetchRooms]);


    const handleHostelFormSuccess = () => {
        setIsHostelDialogOpen(false);
        setEditingHostel(null);
        fetchHostels();
    };
    const handleRoomFormSuccess = () => {
        setIsRoomDialogOpen(false);
        setEditingRoom(null);
        fetchRooms();
    };
    const handleAllocateSuccess = () => {
        setIsAllocateDialogOpen(false);
        setSelectedRoom(null);
        fetchRooms();
    };

    const handleDeleteHostel = (id: string) => {
        if(confirm('Are you sure? Deleting a hostel will also delete all its rooms and unassign students.')) {
            startTransition(() => actions.deleteHostel(id, schoolId).then(fetchHostels));
        }
    }
    const handleDeleteRoom = (id: string) => {
        if(confirm('Are you sure? Deleting a room will unassign any students in it.')) {
            startTransition(() => actions.deleteRoom(id, schoolId).then(fetchRooms));
        }
    }
    
    const handleAllocateClick = (room: Room) => {
        setSelectedRoom(room);
        setIsAllocateDialogOpen(true);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Hostels List */}
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Hostels</CardTitle>
                            <Button size="sm" onClick={() => { setEditingHostel(null); setIsHostelDialogOpen(true); }}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingHostels ? <Loader2 className="mx-auto h-6 w-6 animate-spin"/> :
                         hostels.length > 0 ? (
                            <ul className="space-y-2">
                                {hostels.map(h => (
                                    <li key={h.id} 
                                        className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${selectedHostel?.id === h.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                        onClick={() => setSelectedHostel(h)}
                                    >
                                        <div>
                                            <p className="font-semibold">{h.name}</p>
                                            <p className="text-xs opacity-80">{h.type} Hostel</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingHostel(h); setIsHostelDialogOpen(true);}}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeleteHostel(h.id);}}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-muted-foreground text-center">No hostels found.</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Rooms and Allocation */}
            <div className="md:col-span-2">
                <Card>
                     <CardHeader>
                        <div className="flex justify-between items-center">
                           <div>
                             <CardTitle>Rooms for {selectedHostel?.name || '...'}</CardTitle>
                             <CardDescription>Manage rooms and allocate students for the selected hostel.</CardDescription>
                           </div>
                           <Button onClick={() => { setEditingRoom(null); setIsRoomDialogOpen(true);}} disabled={!selectedHostel}>
                                <BedDouble className="mr-2 h-4 w-4" /> Add Room
                           </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {selectedHostel ? (
                            loadingRooms ? <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                            : <RoomList rooms={rooms} onEdit={(room) => {setEditingRoom(room); setIsRoomDialogOpen(true);}} onDelete={handleDeleteRoom} onAllocate={handleAllocateClick} />
                        ) : (
                            <div className="text-center py-10 border rounded-lg bg-muted/50">
                                <p className="text-muted-foreground">Select a hostel to view its rooms.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {isHostelDialogOpen && <HostelDialog isOpen={isHostelDialogOpen} setIsOpen={setIsHostelDialogOpen} schoolId={schoolId} editingHostel={editingHostel} onSuccess={handleHostelFormSuccess} />}
            {isRoomDialogOpen && selectedHostel && <RoomDialog isOpen={isRoomDialogOpen} setIsOpen={setIsRoomDialogOpen} schoolId={schoolId} hostel={selectedHostel} editingRoom={editingRoom} onSuccess={handleRoomFormSuccess} />}
            {isAllocateDialogOpen && selectedHostel && selectedRoom && (
                <AllocateStudentDialog 
                    isOpen={isAllocateDialogOpen} 
                    setIsOpen={setIsAllocateDialogOpen} 
                    schoolId={schoolId} 
                    hostel={selectedHostel} 
                    room={selectedRoom} 
                    onSuccess={handleAllocateSuccess} 
                />
            )}
        </div>
    );
}

const RoomList = ({ rooms, onEdit, onDelete, onAllocate }: { rooms: Room[], onEdit: (room: Room) => void, onDelete: (id: string) => void, onAllocate: (room: Room) => void }) => {
    if (rooms.length === 0) {
        return <p className="text-sm text-center text-muted-foreground py-10">No rooms found in this hostel. Click "Add Room" to create one.</p>
    }
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Room No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Occupancy</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rooms.map(room => (
                        <TableRow key={room.id}>
                            <TableCell className="font-bold">{room.roomNumber}</TableCell>
                            <TableCell>{room.roomType}</TableCell>
                            <TableCell>{room.currentOccupancy} / {room.capacity}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" className="mr-2" onClick={() => onAllocate(room)} disabled={room.currentOccupancy >= room.capacity}>
                                    <UserPlus className="mr-2 h-4 w-4"/>Allocate
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onEdit(room)}><Edit className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(room.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
