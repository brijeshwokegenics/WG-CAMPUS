
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, BookUp, BookDown, Library } from 'lucide-react';
import { getStudentsForSchool } from '@/app/actions/academics';
import { getUsersForSchool } from '@/app/actions/users';
import { getBooks, getMemberHistory, issueBook, returnBook } from '@/app/actions/library';
import { format, isAfter } from 'date-fns';
import { useFormState } from 'react-dom';
import { Alert, AlertDescription } from '../ui/alert';
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

            const students: Member[] = (studentRes.students || []).map((s: any) => ({
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

    const handleSelectMember = (member: Member) => {
        setSelectedMember(member);
        setSearchResults([]);
        setSearchTerm('');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Find Library Member</CardTitle>
                    <CardDescription>Search for a student or staff member by name or ID to manage their book circulation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative max-w-lg">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Start typing a name or ID..." 
                            className="pl-8" 
                            value={searchTerm} 
                            onChange={e => {
                                setSearchTerm(e.target.value); 
                                debouncedSearch(e.target.value);
                            }} 
                        />
                    </div>
                    {isSearching && <Loader2 className="animate-spin mx-auto"/>}
                    {searchResults.length > 0 && (
                        <div className="border rounded-md max-h-60 overflow-y-auto max-w-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Details</TableHead><TableHead>Action</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                     {searchResults.map(res => (
                                        <TableRow key={`${res.type}-${res.id}`}>
                                            <TableCell className="font-medium">{res.name} <Badge variant="secondary">{res.type}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{res.details}</TableCell>
                                            <TableCell><Button size="sm" onClick={() => handleSelectMember(res)}>Select</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedMember ? (
                <MemberCirculationDashboard key={selectedMember.id} schoolId={schoolId} member={selectedMember} />
            ) : (
                <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Library className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4">Search for and select a member to begin.</p>
                </div>
            )}
        </div>
    );
}


function MemberCirculationDashboard({ schoolId, member }: { schoolId: string, member: Member }) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        const memberHistory = await getMemberHistory(schoolId, member.id);
        setHistory(memberHistory);
        setLoading(false);
    }, [schoolId, member.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const issuedBooks = history.filter(h => h.status === 'issued');

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Circulation for: {member.name} <Badge variant="outline">{member.type}</Badge></h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <IssuedBooksTable issuedBooks={issuedBooks} schoolId={schoolId} loading={loading} onReturnSuccess={fetchHistory} />
                <IssueNewBookForm schoolId={schoolId} member={member} onIssueSuccess={fetchHistory} />
            </div>
        </div>
    );
}

function IssuedBooksTable({ issuedBooks, schoolId, loading, onReturnSuccess }: { issuedBooks: any[], schoolId: string, loading: boolean, onReturnSuccess: () => void }) {
    const [isReturning, startReturnTransition] = useTransition();
    const [returningId, setReturningId] = useState<string | null>(null);

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
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Currently Issued Books ({issuedBooks.length})</CardTitle>
                <CardDescription>Books that need to be returned by this member.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow><TableHead>Book Title</TableHead><TableHead>Due Date</TableHead><TableHead>Action</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            : issuedBooks.length > 0 ? issuedBooks.map(item => {
                                const isOverdue = item.dueDate && isAfter(new Date(), new Date(item.dueDate));
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.bookTitle}</TableCell>
                                        <TableCell className={cn(isOverdue && "font-bold text-destructive")}>{item.dueDate ? format(new Date(item.dueDate), 'dd-MMM-yyyy') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" onClick={() => handleReturn(item.id)} disabled={isReturning && returningId === item.id}>
                                                {isReturning && returningId === item.id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <BookDown className="h-4 w-4 mr-2" />}
                                                Return
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                            : <TableRow><TableCell colSpan={3} className="h-24 text-center">No books currently issued.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

function IssueNewBookForm({ schoolId, member, onIssueSuccess }: { schoolId: string, member: Member, onIssueSuccess: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState<any[]>([]);
    const [isSearching, startSearchTransition] = useTransition();

    const [issueState, formAction] = useFormState(issueBook, { success: false, error: null });

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

    useEffect(() => {
        if (issueState.success) {
            onIssueSuccess();
            setSearchTerm('');
            setBooks([]);
        }
    }, [issueState.success, onIssueSuccess]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Issue a New Book</CardTitle>
                <CardDescription>Search for an available book to issue to {member.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {issueState.error && <Alert variant="destructive"><AlertDescription>{issueState.error}</AlertDescription></Alert>}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, author, or ISBN..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                    />
                </div>
                {isSearching ? <div className="text-center p-4"><Loader2 className="animate-spin mx-auto"/></div>
                : books.length > 0 ? (
                    <div className="border rounded-md max-h-80 overflow-y-auto">
                        <Table>
                             <TableHeader>
                                <TableRow><TableHead>Book Title</TableHead><TableHead>Author</TableHead><TableHead>Action</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.map(book => (
                                     <TableRow key={book.id}>
                                         <TableCell className="font-medium">{book.title}</TableCell>
                                         <TableCell className="text-muted-foreground">{book.author}</TableCell>
                                         <TableCell>
                                             <form action={formAction}>
                                                <input type="hidden" name="schoolId" value={schoolId} />
                                                <input type="hidden" name="bookId" value={book.id} />
                                                <input type="hidden" name="memberId" value={member.id} />
                                                <input type="hidden" name="memberType" value={member.type} />
                                                 <Button type="submit" size="sm" variant="outline"><BookUp className="mr-2 h-4 w-4"/> Issue</Button>
                                             </form>
                                         </TableCell>
                                     </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : searchTerm.length >=3 && <p className="text-center text-xs text-muted-foreground py-4">No available books match your search.</p>}
            </CardContent>
        </Card>
    );
}
