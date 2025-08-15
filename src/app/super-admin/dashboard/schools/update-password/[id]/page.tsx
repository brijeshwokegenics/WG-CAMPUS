
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getSchool, updateSchoolPassword } from '@/app/actions/school';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { State } from '@/app/actions/school';

type SchoolData = {
    id: string;
    schoolName: string;
    schoolId: string;
} | null;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? 'Updating Password...' : 'Update Password'}
        </Button>
    );
}

export default function UpdatePasswordPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [school, setSchool] = useState<SchoolData>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const initialState: State = { message: null, errors: {} };
    const updatePasswordWithId = updateSchoolPassword.bind(null, id);
    const [state, dispatch] = useFormState(updatePasswordWithId, initialState);


    useEffect(() => {
        async function fetchSchool() {
            setLoading(true);
            const result = await getSchool(id);
            if (result.error) {
                setError(result.error);
            } else {
                setSchool(result.school as SchoolData);
            }
            setLoading(false);
        }
        fetchSchool();
    }, [id]);

    useEffect(() => {
        if (state?.message === 'Password updated successfully!') {
            setTimeout(() => {
                window.location.href = '/super-admin/dashboard/schools';
            }, 2000); 
        }
    }, [state]);


    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading school data...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>;
    }
    
    if (!school) {
        return <div className="flex items-center justify-center min-h-screen">School not found.</div>;
    }

    return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-lg">
                <Link href="/super-admin/dashboard/schools" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Schools
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Update Password</CardTitle>
                        <CardDescription>Set a new password for {school.schoolName} ({school.schoolId}).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={dispatch} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" name="password" type="password" required />
                                {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input id="confirm-password" name="confirmPassword" type="password" required />
                                {state.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword.join(', ')}</p>}
                            </div>

                            {state.message && (
                                <p className={`text-sm text-center mt-4 ${state.errors ? 'text-destructive' : 'text-green-600'}`}>
                                    {state.message}
                                </p>
                            )}
                            
                            <div className="pt-4">
                                <SubmitButton />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
