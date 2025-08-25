
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLibraryDashboardSummary } from "@/app/actions/library";
import { Book, BookCheck, BookX, History, Tags } from "lucide-react";
import Link from "next/link";

type StatCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

export default async function LibrarianDashboardPage({ params }: { params: { schoolId: string } }) {
    const schoolId = params.schoolId;

    const summaryResult = await getLibraryDashboardSummary(schoolId);
    const summary = summaryResult.success ? summaryResult.data : { totalBooks: 0, totalIssued: 0, totalOverdue: 0 };


    return (
        <div className="space-y-6">
            <header className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Librarian Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Here's a snapshot of library activity.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Total Books" value={summary.totalBooks} icon={<Book className="h-4 w-4 text-muted-foreground"/>}/>
                <StatCard title="Books Issued" value={summary.totalIssued} icon={<BookCheck className="h-4 w-4 text-muted-foreground"/>}/>
                <StatCard title="Books Overdue" value={summary.totalOverdue} icon={<BookX className="h-4 w-4 text-muted-foreground"/>}/>
            </div>

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
