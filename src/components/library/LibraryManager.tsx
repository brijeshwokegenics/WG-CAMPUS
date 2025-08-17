
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Tags, BookCheck, History } from 'lucide-react';
import { BookCatalog } from './BookCatalog';
import { BookCategories } from './BookCategories';
import { IssueReturn } from './IssueReturn';
import { IssueHistory } from './IssueHistory';


export function LibraryManager({ schoolId }: { schoolId: string }) {

    return (
        <Tabs defaultValue="catalog" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="catalog">
                    <Book className="mr-2 h-4 w-4" /> Book Catalog
                </TabsTrigger>
                <TabsTrigger value="issue-return">
                    <BookCheck className="mr-2 h-4 w-4" /> Issue / Return
                </TabsTrigger>
                <TabsTrigger value="history">
                    <History className="mr-2 h-4 w-4" /> Issue History
                </TabsTrigger>
                 <TabsTrigger value="categories">
                    <Tags className="mr-2 h-4 w-4" /> Book Categories
                </TabsTrigger>
            </TabsList>
            <TabsContent value="catalog">
                <Card>
                    <CardContent className="pt-6">
                        <BookCatalog schoolId={schoolId} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="issue-return">
                 <Card>
                    <CardContent className="pt-6">
                        <IssueReturn schoolId={schoolId} />
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="history">
                 <Card>
                    <CardContent className="pt-6">
                         <IssueHistory schoolId={schoolId} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="categories">
                <Card>
                    <CardContent className="pt-6">
                        <BookCategories schoolId={schoolId} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
