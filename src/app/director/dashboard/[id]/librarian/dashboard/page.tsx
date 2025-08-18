
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, BookCheck, History, Tags } from "lucide-react";
import Link from "next/link";

export default function LibrarianDashboardPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Librarian Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Manage all library activities.</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                 <Link href={`/director/dashboard/${schoolId}/admin/library`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Book Catalog</CardTitle>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View, add, or manage books.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/admin/library`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Issue / Return</CardTitle>
                            <BookCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Manage book circulation.</p></CardContent>
                    </Card>
                </Link>
                <Link href={`/director/dashboard/${schoolId}/admin/library`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Circulation History</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">View all past transactions.</p></CardContent>
                    </Card>
                </Link>
                 <Link href={`/director/dashboard/${schoolId}/admin/library`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Categories</CardTitle>
                            <Tags className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><p className="text-xs text-muted-foreground">Manage book categories.</p></CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
