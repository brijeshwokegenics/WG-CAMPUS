
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createRoom, updateRoom } from '@/app/actions/hostel';

const RoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required.'),
  roomType: z.string().min(3, 'Room type is required (e.g., 2-Seater AC).'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1.'),
  fee: z.coerce.number().min(0).optional(),
});
type FormValues = z.infer<typeof RoomSchema>;

export function RoomDialog({ isOpen, setIsOpen, schoolId, hostel, editingRoom, onSuccess }: any) {
    const action = editingRoom ? updateRoom : createRoom;
    const [state, formAction] = useFormState(action, { success: false, error: null });

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(RoomSchema),
    });

    useEffect(() => {
        if (isOpen) {
            reset(editingRoom || { roomNumber: '', roomType: '', capacity: 2, fee: 0 });
        }
    }, [isOpen, editingRoom, reset]);

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state.success, onSuccess]);

    const onFormSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('hostelId', hostel.id);
        if (editingRoom) formData.append('id', editingRoom.id);
        Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingRoom ? 'Edit Room' : `Add Room to ${hostel.name}`}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomNumber">Room Number</Label>
                            <Input id="roomNumber" {...register('roomNumber')} />
                            {errors.roomNumber && <p className="text-sm text-destructive">{errors.roomNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input id="capacity" type="number" {...register('capacity')} />
                            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomType">Room Type</Label>
                            <Input id="roomType" {...register('roomType')} placeholder="e.g., 2-Seater AC" />
                            {errors.roomType && <p className="text-sm text-destructive">{errors.roomType.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="fee">Fee (per year)</Label>
                            <Input id="fee" type="number" {...register('fee')} placeholder="e.g., 60000" />
                            {errors.fee && <p className="text-sm text-destructive">{errors.fee.message}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {editingRoom ? 'Save Changes' : 'Add Room'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
