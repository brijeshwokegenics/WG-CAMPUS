
'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getInventoryItemHistory } from '@/app/actions/inventory';
import { type Item, type HistoryEntry } from '@/components/InventoryManager';

interface ItemHistoryDialogProps {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    item: Item;
    schoolId: string;
}

export const ItemHistoryDialog = ({ isOpen, setIsOpen, item, schoolId }: ItemHistoryDialogProps) => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (isOpen) {
                setLoading(true);
                const res = await getInventoryItemHistory(item.id, schoolId);
                if (res.success && res.data) {
                    setHistory(res.data as HistoryEntry[]);
                }
                setLoading(false);
            }
        }
        fetchHistory();
    }, [isOpen, item.id, schoolId]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Stock History: {item.name}</DialogTitle></DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> :
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Qty</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {history.length > 0 ? history.map(h => (
                                    <TableRow key={h.id}>
                                        <TableCell className="text-xs">{format(h.date, 'dd-MMM-yy hh:mm a')}</TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${h.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                                {h.type.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold">{h.quantity}</TableCell>
                                        <TableCell>{h.notes}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No history for this item.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    }
                </div>
            </DialogContent>
        </Dialog>
    );
};
