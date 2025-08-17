
'use client';

import React, { useState, useEffect } from 'react';
import { getFullIssueHistory } from '@/app/actions/library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Issue = {
    id: string;
    bookTitle: string;
    memberName: string;
    memberType: 'Student' | 'Staff';
    issueDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    status: 'issued' | 'returned';
};

export function IssueHistory({ schoolId }: { schoolId: string }) {
    const [history, setHistory] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const result = await getFullIssueHistory(schoolId);
            setHistory(result as Issue[]);
            setLoading(false);
        }
        fetchData();
    }, [schoolId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Library Circulation History</CardTitle>
                <CardDescription>A complete log of all issued and returned books.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Book Title</TableHead>
                                <TableHead>Member Name</TableHead>
                                <TableHead>Issue Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Return Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : history.length > 0 ? (
                                history.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.bookTitle}</TableCell>
                                        <TableCell>
                                            {item.memberName}
                                            <Badge variant="outline" className="ml-2 text-xs">{item.memberType}</Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(item.issueDate), 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell>{format(new Date(item.dueDate), 'dd-MMM-yyyy')}</TableCell>
                                        <TableCell>
                                            {item.returnDate ? format(new Date(item.returnDate), 'dd-MMM-yyyy') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                             <Badge variant={item.status === 'issued' ? 'destructive' : 'default'}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No issue history found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
