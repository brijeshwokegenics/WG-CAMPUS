
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeeHeadManager } from './FeeHeadManager';
import { ClassFeeStructure } from './ClassFeeStructure';
import { Banknote, GraduationCap } from 'lucide-react';
import { getClassesForSchool, getFeeHeads } from '@/app/actions/academics';

type ClassData = { id: string; name: string; sections: string[]; };
type FeeHead = { id: string; name: string; description?: string; type: "One-time" | "Annual" | "Monthly" | "Quarterly"; };

interface FeeStructureManagerProps {
    schoolId: string;
}

export function FeeStructureManager({ schoolId }: FeeStructureManagerProps) {
    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
    const [allClasses, setAllClasses] = useState<ClassData[]>([]);

    useEffect(() => {
        async function fetchInitialData() {
            const [classResult, feeHeadsResult] = await Promise.all([
                getClassesForSchool(schoolId),
                getFeeHeads(schoolId)
            ]);
            if(classResult.success) setAllClasses(classResult.data || []);
            if(feeHeadsResult.success) setFeeHeads(feeHeadsResult.data || []);
        }
        fetchInitialData();
    }, [schoolId]);

    const handleFeeHeadsUpdate = (newFeeHeads: FeeHead[]) => {
        setFeeHeads(newFeeHeads);
    };

    return (
        <Tabs defaultValue="class-fees" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="class-fees"><GraduationCap className="mr-2 h-4 w-4" /> Class Fee Structures</TabsTrigger>
                <TabsTrigger value="fee-heads"><Banknote className="mr-2 h-4 w-4" /> Manage Fee Heads</TabsTrigger>
            </TabsList>
            <TabsContent value="class-fees">
                <ClassFeeStructure 
                    schoolId={schoolId}
                    allClasses={allClasses}
                    feeHeads={feeHeads}
                />
            </TabsContent>
            <TabsContent value="fee-heads">
                <FeeHeadManager
                    schoolId={schoolId}
                    initialFeeHeads={feeHeads}
                    onFeeHeadsUpdate={handleFeeHeadsUpdate}
                />
            </TabsContent>
        </Tabs>
    );
}
