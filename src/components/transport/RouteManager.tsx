'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';

import { getRoutes, createRoute, updateRoute, deleteRoute, getVehicles } from '@/app/actions/transport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Loader2, Route as RouteIcon, MapPin, Wallet } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

type Vehicle = { id: string; vehicleNumber: string; };
type Route = { id: string; name: string; vehicleId?: string; stops: { name: string; fee: number }[] };

const StopSchema = z.object({
  name: z.string().min(2, 'Stop name is required.'),
  fee: z.coerce.number().min(0).default(0),
});
const RouteFormSchema = z.object({
  name: z.string().min(3, "Route name is required."),
  vehicleId: z.string().optional(),
  stops: z.array(StopSchema).min(1, "At least one stop is required."),
});
type RouteFormValues = z.infer<typeof RouteFormSchema>;

export function RouteManager({ schoolId }: { schoolId: string }) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Route | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchData = async () => {
        setLoading(true);
        const [routesRes, vehiclesRes] = await Promise.all([getRoutes(schoolId), getVehicles(schoolId)]);
        setRoutes(routesRes);
        setVehicles(vehiclesRes as Vehicle[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [schoolId]);

    const handleFormSuccess = () => {
        setIsDialogOpen(false);
        setEditingRoute(null);
        fetchData();
    };

    const handleAddNew = () => {
        setEditingRoute(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (route: Route) => {
        setEditingRoute(route);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Are you sure you want to delete this route? This will unassign all students from it.')) {
            startTransition(() => {
                deleteRoute(id, schoolId).then(fetchData);
            });
        }
    };
    
    const getVehicleNumber = (id?: string) => vehicles.find(v => v.id === id)?.vehicleNumber || 'Not Assigned';

    return (
         <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Manage Routes</CardTitle>
                        <CardDescription>Define transport routes, stops, and fees.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Route</Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                : routes.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {routes.map(route => (
                            <AccordionItem value={route.id} key={route.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between items-center w-full pr-4">
                                        <div className="flex items-center gap-2">
                                            <RouteIcon className="h-5 w-5 text-primary"/>
                                            <span className="font-semibold">{route.name}</span>
                                            <span className="text-sm text-muted-foreground">({getVehicleNumber(route.vehicleId)})</span>
                                        </div>
                                         <div>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(route);}}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(route.id);}}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="pl-6 pr-2 space-y-2">
                                        {route.stops.map((stop, index) => (
                                            <li key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground"/>
                                                    <span>{stop.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                     <Wallet className="h-4 w-4 text-muted-foreground"/>
                                                     <span>₹ {stop.fee}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : <div className="text-center p-8 text-muted-foreground">No routes created yet.</div>}
            </CardContent>
            
            <RouteFormDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                schoolId={schoolId}
                editingRoute={editingRoute}
                vehicles={vehicles}
                onSuccess={handleFormSuccess}
            />
         </Card>
    );
}

// Dialog for form
function RouteFormDialog({ isOpen, setIsOpen, schoolId, editingRoute, vehicles, onSuccess }: any) {
    const { register, control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RouteFormValues>({
        resolver: zodResolver(RouteFormSchema),
    });
    const { fields, append, remove } = useFieldArray({ control, name: "stops" });

     useEffect(() => {
        if (isOpen) {
            const defaultValues = editingRoute || { name: '', stops: [{name: '', fee: 0}] };
            reset(defaultValues);
        }
    }, [isOpen, editingRoute, reset]);
    
    const action = editingRoute ? updateRoute : createRoute;
    const [state, formAction] = useFormState(action, { success: false, error: null, details: null });

    useEffect(() => {
        if (state.success) onSuccess();
    }, [state, onSuccess]);

    const onFormSubmit = (data: RouteFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        if (editingRoute) formData.append('id', editingRoute.id);
        formData.append('name', data.name);
        formData.append('vehicleId', data.vehicleId || '');
        formData.append('stops', JSON.stringify(data.stops));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingRoute ? 'Edit Route' : 'Create New Route'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
                    {state.error && <p className="text-sm text-destructive mb-4">{state.error}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Route Name</Label>
                            <Input {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Vehicle (Optional)</Label>
                            <Select onValueChange={(value) => control._formValues.vehicleId = value} defaultValue={editingRoute?.vehicleId}>
                                <SelectTrigger><SelectValue placeholder="Select a vehicle" /></SelectTrigger>
                                <SelectContent>{vehicles.map((v: Vehicle) => <SelectItem key={v.id} value={v.id}>{v.vehicleNumber}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <Label>Stops</Label>
                        <div className="space-y-2 mt-2 p-3 border rounded-md">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <Input {...register(`stops.${index}.name`)} placeholder={`Stop ${index + 1} Name`} />
                                <Input type="number" {...register(`stops.${index}.fee`)} placeholder="Fee" className="w-28" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({name: '', fee: 0})}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Stop
                        </Button>
                        </div>
                         {errors.stops && <p className="text-sm text-destructive mt-1">{errors.stops.message || errors.stops.root?.message}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Route
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
