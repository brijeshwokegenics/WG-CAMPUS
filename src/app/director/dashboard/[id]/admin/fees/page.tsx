
import { getClassesForSchool } from "@/app/actions/academics";
import { FeeManager } from "@/components/FeeManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FeeManagementPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    const classResult = await getClassesForSchool(schoolId);
    const classes = classResult.success ? classResult.data ?? [] : [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
                <p className="text-muted-foreground">
                    Collect fees, view payment history, and generate receipts.
                </p>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Fee Collection</CardTitle>
                    <CardDescription>
                        Search for a student to begin the fee collection process.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FeeManager schoolId={schoolId} classes={classes} />
                </CardContent>
            </Card>
        </div>
    );
}

    