
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, BookUp, BookDown, Library } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getStudentsForSchool } from '@/app/actions/academics';
import { getUsersForSchool } from '@/app/actions/users';
import { getBooks, getMemberHistory, issueBook, returnBook } from '@/app/actions/library';
import { format, isAfter } from 'date-fns';
import { useFormState } from 'react-dom';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type Member = {
    id: string;
    name: string;
    type: 'Student' | 'Staff';
    details: string;
};

export function IssueReturn({ schoolId }: { schoolId: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [isSearching, startSearchTransition] = useTransition();
    
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberHistory, setMemberHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const debouncedSearch = useDebouncedCallback(async (term: string) => {
        if (term.length < 3) {
            setSearchResults([]);
            return;
        }
        startSearchTransition(async () => {
            const [studentRes, staffRes] = await Promise.all([
                getStudentsForSchool({ schoolId, searchTerm: term }),
                getUsersForSchool(schoolId, term)
            ]);

            const students: Member[] = (studentRes || []).map((s: any) => ({
                id: s.id,
                name: s.studentName,
                type: 'Student',
                details: `${s.className} - ${s.section}`
            }));

            const staff: Member[] = (staffRes.data || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                type: 'Staff',
                details: s.role
            }));
            
            setSearchResults([...students, ...staff]);
        });
    }, 500);

    const fetchHistory = useCallback(async (memberId: string) => {
        setLoadingHistory(true);
        const history = await getMemberHistory(schoolId, memberId);
        setMemberHistory(history);
        setLoadingHistory(false);
    }, [schoolId]);

    const handleSelectMember = (member: Member) => {
        setSelectedMember(member);
        setSearchResults([]);
        setSearchTerm('');
        fetchHistory(member.id);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Find Member</CardTitle>
                         <CardDescription>Search for a student or staff member by name or ID.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search name or ID..." className="pl-8" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); debouncedSearch(e.target.value);}} />
                        </div>
                        {isSearching && <Loader2 className="animate-spin mx-auto"/>}
                        {searchResults.length > 0 && (
                            <div className="border rounded-md max-h-60 overflow-y-auto">
                                {searchResults.map(res => (
                                    <div key={`${res.type}-${res.id}`} onClick={() => handleSelectMember(res)} className="p-2 hover:bg-muted cursor-pointer text-sm">
                                        <p className="font-semibold flex justify-between items-center">
                                            {res.name}
                                            <Badge variant="secondary">{res.type}</Badge>
                                        </p>
                                        <p className="text-xs text-muted-foreground">{res.details}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedMember && (
                    <IssueBookForm schoolId={schoolId} member={selectedMember} onIssueSuccess={() => fetchHistory(selectedMember.id)}/>
                )}
            </div>

            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Member's Current Status</CardTitle>
                        {selectedMember ? (
                            <CardDescription>Books currently issued to {selectedMember.name}.</CardDescription>
                        ) : (
                            <CardDescription>Search for and select a member to view their status.</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                         {loadingHistory ? <div className="text-center p-8"><Loader2 className="animate-spin mx-auto"/></div> 
                         : selectedMember ? <IssuedBooksList schoolId={schoolId} history={memberHistory} onReturnSuccess={() => fetchHistory(selectedMember.id)} />
                         : <div className="text-center p-8 text-muted-foreground"><Library className="mx-auto h-12 w-12 text-gray-300" />Please select a member.</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function IssueBookForm({ schoolId, member, onIssueSuccess }: { schoolId: string, member: Member, onIssueSuccess: () => void}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState<any[]>([]);
    const [isSearching, startSearchTransition] = useTransition();

    const [state, formAction] = useFormState(issueBook, { success: false, error: null });

    const debouncedSearch = useDebouncedCallback((term) => {
        if (term.length < 3) {
            setBooks([]);
            return;
        }
        startSearchTransition(async () => {
            const results = await getBooks(schoolId, undefined, term);
            setBooks(results.filter(b => b.availableStock > 0));
        });
    }, 500);

    const handleIssue = (bookId: string) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        formData.append('bookId', bookId);
        formData.append('memberId', member.id);
        formData.append('memberType', member.type);
        formAction(formData);
    }
    
    useEffect(() => {
        if (state.success) {
            onIssueSuccess();
            setSearchTerm('');
            setBooks([]);
        }
    }, [state.success, onIssueSuccess]);

    return (
        <Card>
            <CardHeader><CardTitle>Issue a New Book</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search for a book..." className="pl-8" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); debouncedSearch(e.target.value);}}/>
                </div>
                 {isSearching && <Loader2 className="animate-spin mx-auto"/>}
                 {books.length > 0 && (
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                        {books.map(book => (
                            <div key={book.id} className="p-2 flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold">{book.title}</p>
                                    <p className="text-xs text-muted-foreground">{book.author}</p>
                                </div>
                                <form action={() => handleIssue(book.id)}>
                                    <Button type="submit" size="sm" variant="outline"><BookUp className="mr-2 h-4 w-4"/> Issue</Button>
                                </form>
                            </div>
                        ))}
                    </div>
                )}
                 {searchTerm.length >=3 && !isSearching && books.length === 0 && <p className="text-center text-xs text-muted-foreground">No available books match your search.</p>}
            </CardContent>
        </Card>
    );
}

function IssuedBooksList({ schoolId, history, onReturnSuccess }: { schoolId: string, history: any[], onReturnSuccess: () => void }) {
    const [isReturning, startReturnTransition] = useTransition();
    const [returningId, setReturningId] = useState<string|null>(null);

    const handleReturn = (issueId: string) => {
        setReturningId(issueId);
        startReturnTransition(async () => {
            const result = await returnBook(issueId, schoolId);
            if (result.success) {
                onReturnSuccess();
            } else {
                alert(`Error: ${result.error}`);
            }
            setReturningId(null);
        });
    }

    const issuedBooks = history.filter(h => h.status === 'issued');

    return (
        <div className="space-y-3">
            {issuedBooks.length > 0 ? issuedBooks.map((item: any) => {
                const isOverdue = item.dueDate && isAfter(new Date(), new Date(item.dueDate));
                return (
                    <div key={item.id} className="border p-3 rounded-md flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{item.bookTitle}</p>
                            <p className="text-sm">Issued: {item.issueDate ? format(new Date(item.issueDate), 'dd-MMM-yyyy') : 'N/A'}</p>
                            <p className={cn("text-sm", isOverdue && "font-bold text-destructive")}>
                                Due: {item.dueDate ? format(new Date(item.dueDate), 'dd-MMM-yyyy') : 'N/A'}
                            </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleReturn(item.id)} disabled={isReturning && returningId === item.id}>
                            {isReturning && returningId === item.id ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <BookDown className="h-4 w-4 mr-2"/>}
                            Return
                        </Button>
                    </div>
                )
            }) : <p className="text-center text-sm text-muted-foreground p-4">No books currently issued.</p>}
        </div>
    )
}
