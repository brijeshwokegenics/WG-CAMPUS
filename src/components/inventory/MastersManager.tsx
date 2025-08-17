'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import * as actions from '@/app/actions/inventory';

import { CategoryDialog } from './CategoryDialog';
import { VendorDialog } from './VendorDialog';
import { UnitDialog } from './UnitDialog';
import { LocationDialog } from './LocationDialog';


export function MastersManager({ schoolId }: { schoolId: string }) {
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [units, setUnits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isVendorOpen, setIsVendorOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [isUnitOpen, setIsUnitOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    
    const [isPending, startTransition] = useTransition();

    const fetchData = async () => {
        setLoading(true);
        const [catRes, venRes, unitRes, locRes] = await Promise.all([
            actions.getItemCategories(schoolId),
            actions.getVendors(schoolId),
            actions.getUnits(schoolId),
            actions.getLocations(schoolId)
        ]);
        setCategories(catRes as any);
        setVendors(venRes as any);
        setUnits(unitRes as any);
        setLocations(locRes as any);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [schoolId]);

    const MasterSection = ({ title, data, onAdd, onEdit, onDelete, columns, renderRow, emptyText }: any) => (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Button size="sm" variant="outline" onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader><TableRow>{columns.map((col: string) => <TableHead key={col}>{col}</TableHead>)}<TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {loading ? (
                                <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : data.length > 0 ? (
                                data.map((item: any) => renderRow(item, onEdit, onDelete))
                            ) : (
                                <TableRow><TableCell colSpan={columns.length + 1} className="h-24 text-center">{emptyText}</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MasterSection
                title="Item Categories"
                data={categories}
                onAdd={() => { setEditingCategory(null); setIsCategoryOpen(true); }}
                onEdit={(item: any) => { setEditingCategory(item); setIsCategoryOpen(true); }}
                onDelete={(id: string) => startTransition(() => actions.deleteItemCategory(id, schoolId).then(fetchData))}
                columns={['Name', 'Description']}
                renderRow={(item: any, onEdit: any, onDelete: any) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </TableCell>
                    </TableRow>
                )}
                emptyText="No categories created."
            />
             <MasterSection
                title="Vendors / Suppliers"
                data={vendors}
                onAdd={() => { setEditingVendor(null); setIsVendorOpen(true); }}
                onEdit={(item: any) => { setEditingVendor(item); setIsVendorOpen(true); }}
                onDelete={(id: string) => startTransition(() => actions.deleteVendor(id, schoolId).then(fetchData))}
                columns={['Name', 'Contact Person', 'Phone']}
                renderRow={(item: any, onEdit: any, onDelete: any) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.contactPerson}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}><Edit className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </TableCell>
                    </TableRow>
                )}
                emptyText="No vendors created."
            />
            <MasterSection
                title="Units of Measure"
                data={units}
                onAdd={() => setIsUnitOpen(true)}
                onDelete={(id: string) => startTransition(() => actions.deleteUnit(id, schoolId).then(fetchData))}
                columns={['Name']}
                renderRow={(item: any, onEdit: any, onDelete: any) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </TableCell>
                    </TableRow>
                )}
                emptyText="No units created."
            />
            <MasterSection
                title="Storage Locations"
                data={locations}
                onAdd={() => setIsLocationOpen(true)}
                onDelete={(id: string) => startTransition(() => actions.deleteLocation(id, schoolId).then(fetchData))}
                columns={['Name']}
                renderRow={(item: any, onEdit: any, onDelete: any) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </TableCell>
                    </TableRow>
                )}
                emptyText="No locations created."
            />

            {isCategoryOpen && <CategoryDialog isOpen={isCategoryOpen} setIsOpen={setIsCategoryOpen} schoolId={schoolId} editingCategory={editingCategory} onSuccess={fetchData} />}
            {isVendorOpen && <VendorDialog isOpen={isVendorOpen} setIsOpen={setIsVendorOpen} schoolId={schoolId} editingVendor={editingVendor} onSuccess={fetchData} />}
            {isUnitOpen && <UnitDialog isOpen={isUnitOpen} setIsOpen={setIsUnitOpen} schoolId={schoolId} onSuccess={fetchData} />}
            {isLocationOpen && <LocationDialog isOpen={isLocationOpen} setIsOpen={setIsLocationOpen} schoolId={schoolId} onSuccess={fetchData} />}
        </div>
    );
}
