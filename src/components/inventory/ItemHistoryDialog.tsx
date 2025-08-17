'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { getItemHistory } from '@/app/actions/inventory';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ItemHistoryDialog({ isOpen, setIsOpen, schoolId, item }: any) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (isOpen) {
                setLoading(true);
                const result = await getItemHistory(schoolId, item.id);
                setHistory(result);
                setLoading(false);
            }
        }
        fetchHistory();
    }, [isOpen, schoolId, item.id]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Stock History: {item.name}</DialogTitle>
                    <DialogDescription>Recent transactions for this item.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                         <div className="flex justify-center items-center h-48"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
                    ) : history.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Issued To</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead>Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="text-xs">{format(entry.date, 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell>
                                            <span className={cn('font-semibold', entry.type === 'add' ? 'text-green-600' : 'text-red-600')}>
                                                {entry.type === 'add' ? 'Stock In' : 'Stock Out'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{entry.quantity}</TableCell>
                                        <TableCell>{entry.issuedTo || 'N/A'}</TableCell>
                                        <TableCell className="text-xs">{entry.notes || 'N/A'}</TableCell>
                                        <TableCell className="font-mono text-xs">{entry.previousStock} -> {entry.newStock}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">No history found for this item.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
