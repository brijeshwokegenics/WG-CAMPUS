'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Bus, Route, UserCheck } from 'lucide-react';
import { VehicleManager } from './VehicleManager';
import { RouteManager } from './RouteManager';
import { StudentAllocation } from './StudentAllocation';

type ClassData = { id: string; name: string; sections: string[]; };

export function TransportManager({ schoolId, classes }: { schoolId: string, classes: ClassData[] }) {
    
    return (
        <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vehicles"><Bus className="mr-2 h-4 w-4" /> Vehicles</TabsTrigger>
                <TabsTrigger value="routes"><Route className="mr-2 h-4 w-4" /> Routes</TabsTrigger>
                <TabsTrigger value="allocation"><UserCheck className="mr-2 h-4 w-4" /> Student Allocation</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles">
                <Card><CardContent className="pt-6"><VehicleManager schoolId={schoolId} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="routes">
                <Card><CardContent className="pt-6"><RouteManager schoolId={schoolId} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="allocation">
                 <Card><CardContent className="pt-6"><StudentAllocation schoolId={schoolId} classes={classes} /></CardContent></Card>
            </TabsContent>
        </Tabs>
    );
}
