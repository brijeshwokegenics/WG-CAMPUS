'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Boxes, AppWindow, Settings } from 'lucide-react';
import { ItemManager } from './inventory/ItemManager';
import { MastersManager } from './inventory/MastersManager';

export function InventoryManager({ schoolId }: { schoolId: string }) {
    // This state will be lifted up to here if different tabs need to share it.
    // For now, each tab's main component will manage its own data fetching.

    return (
        <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inventory">
                    <Boxes className="mr-2 h-4 w-4" /> Inventory
                </TabsTrigger>
                <TabsTrigger value="masters">
                    <Settings className="mr-2 h-4 w-4" /> Masters
                </TabsTrigger>
            </TabsList>
            <TabsContent value="inventory">
                <Card>
                    <CardContent className="pt-6">
                        <ItemManager schoolId={schoolId} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="masters">
                <Card>
                    <CardContent className="pt-6">
                        <MastersManager schoolId={schoolId} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
