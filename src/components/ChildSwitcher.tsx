
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getStudentsByParentId } from '@/app/actions/academics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export function ChildSwitcher({ schoolId }: { schoolId: string }) {
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const hasRunEffect = useRef(false);
    
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentStudentId = searchParams.get('studentId') || '';

    useEffect(() => {
        // Prevent this effect from running on every render, especially after client-side navigation.
        if (hasRunEffect.current) return;
        hasRunEffect.current = true;

        async function fetchChildren() {
            setLoading(true);
            // This is a placeholder for getting the real parent ID from session
            const parentSnapshot = await getDocs(query(collection(db, 'users'), where('schoolId', '==', schoolId), where('role', '==', 'Parent')));
            const parent = parentSnapshot.docs.length > 0 ? { id: parentSnapshot.docs[0].id } : null;

            if(parent) {
                const res = await getStudentsByParentId(schoolId, parent.id);
                if (res.success && res.data) {
                    setChildren(res.data);
                    // If no student is selected via URL, or the selected one isn't valid, select the first one by default.
                    const isValidStudentSelected = res.data.some(c => c.id === currentStudentId);
                    if (!isValidStudentSelected && res.data.length > 0) {
                        const params = new URLSearchParams(Array.from(searchParams.entries()));
                        params.set('studentId', res.data[0].id);
                        router.replace(`${pathname}?${params.toString()}`);
                    }
                }
            }
            setLoading(false);
        }
        fetchChildren();
    }, [schoolId, pathname, router, searchParams, currentStudentId]);
    
    const handleChildChange = (studentId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('studentId', studentId);
        router.push(`${pathname}?${params.toString()}`);
    };
    
    const selectedChildExists = children.some(child => child.id === currentStudentId);

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin"/>
    }
    
    if (children.length <= 1) {
        return null; // Don't show switcher for one or zero children
    }

    return (
        <Select value={selectedChildExists ? currentStudentId : ''} onValueChange={handleChildChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select child..." />
            </SelectTrigger>
            <SelectContent>
                {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                        {child.studentName}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

