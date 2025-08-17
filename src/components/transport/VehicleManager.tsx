'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';

import { createVehicle, getVehicles, updateVehicle, deleteVehicle } from '@/app/actions/transport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';

type Vehicle = { id: string; vehicleNumber: string; model?: string; capacity: number; driverName?: string; driverContact?: string; };

const VehicleFormSchema = z.object({
  vehicleNumber: z.string().min(3, "Vehicle number is required."),
  model: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
});
type VehicleFormValues = z.infer<typeof VehicleFormSchema>;

export function VehicleManager({ schoolId }: { schoolId: string }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchVehicles = async () => {
        setLoading(true);
        const result = await getVehicles(schoolId);
        setVehicles(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, [schoolId]);

    const handleFormSuccess = () => {
        setIsDialogOpen(false);
        setEditingVehicle(null);
        fetchVehicles();
    };

    const handleAddNew = () => {
        setEditingVehicle(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this vehicle?')) {
            startTransition(() => {
                deleteVehicle(id, schoolId).then(fetchVehicles);
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Vehicles</CardTitle>
                        <CardDescription>Add, edit, or remove school transport vehicles.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Vehicle</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vehicle Number</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Driver Name</TableHead>
                                <TableHead>Driver Contact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : vehicles.length > 0 ? vehicles.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.vehicleNumber}</TableCell>
                                    <TableCell>{v.model}</TableCell>
                                    <TableCell>{v.capacity}</TableCell>
                                    <TableCell>{v.driverName}</TableCell>
                                    <TableCell>{v.driverContact}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={6} className="text-center h-24">No vehicles created yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <VehicleFormDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                schoolId={schoolId}
                editingVehicle={editingVehicle}
                onSuccess={handleFormSuccess}
            />
        </Card>
    );
}

// Dialog sub-component for the form
interface VehicleFormDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    schoolId: string;
    editingVehicle: Vehicle | null;
    onSuccess: () => void;
}

function VehicleFormDialog({ isOpen, setIsOpen, schoolId, editingVehicle, onSuccess }: VehicleFormDialogProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<VehicleFormValues>({
        resolver: zodResolver(VehicleFormSchema),
    });

    useEffect(() => {
        if (isOpen) {
            reset(editingVehicle || {});
        }
    }, [isOpen, editingVehicle, reset]);
    
    const action = editingVehicle ? updateVehicle : createVehicle;
    const [state, formAction] = useFormState(action, { success: false, error: null });

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state, onSuccess]);

    const onFormSubmit = (data: VehicleFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingVehicle) formData.append('id', editingVehicle.id);
        Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Create New Vehicle'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Vehicle Number</Label>
                            <Input {...register('vehicleNumber')} />
                            {errors.vehicleNumber && <p className="text-sm text-destructive">{errors.vehicleNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <Input {...register('model')} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input type="number" {...register('capacity')} />
                            {errors.capacity && <p className="text-sm text-destructive">{errors.capacity.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label>Driver Name</Label>
                            <Input {...register('driverName')} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Driver Contact</Label>
                        <Input {...register('driverContact')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
