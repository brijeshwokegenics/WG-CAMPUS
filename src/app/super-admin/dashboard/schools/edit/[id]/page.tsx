
'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getSchool, updateSchool } from '@/app/actions/school';
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
    contactEmail: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    phone: string;
    schoolId: string;
    enabled: boolean;
} | null;

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? 'Saving Changes...' : 'Save Changes'}
        </Button>
    );
}

export default function EditSchoolPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [school, setSchool] = useState<SchoolData>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const initialState: State = { message: null, errors: {} };
    const updateSchoolWithId = updateSchool.bind(null, id);
    const [state, dispatch] = useFormState(updateSchoolWithId, initialState);


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
        if (state?.message === 'School updated successfully!') {
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
            <div className="w-full max-w-4xl">
                <Link href="/super-admin/dashboard/schools" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Schools
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Edit School Details</CardTitle>
                        <CardDescription>Update the information for {school.schoolName}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={dispatch} className="space-y-6">
                            <input type="hidden" name="schoolId" value={school.schoolId} />
                            <input type="hidden" name="enabled" value={String(school.enabled)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="school-name">School Name</Label>
                                    <Input id="school-name" name="schoolName" defaultValue={school.schoolName} required />
                                    {state.errors?.schoolName && <p className="text-sm text-destructive">{state.errors.schoolName.join(', ')}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-email">Contact Email</Label>
                                    <Input id="contact-email" name="contactEmail" type="email" defaultValue={school.contactEmail} required />
                                     {state.errors?.contactEmail && <p className="text-sm text-destructive">{state.errors.contactEmail.join(', ')}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" defaultValue={school.address} required />
                                {state.errors?.address && <p className="text-sm text-destructive">{state.errors.address.join(', ')}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" defaultValue={school.city} required />
                                    {state.errors?.city && <p className="text-sm text-destructive">{state.errors.city.join(', ')}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" name="state" defaultValue={school.state} required />
                                     {state.errors?.state && <p className="text-sm text-destructive">{state.errors.state.join(', ')}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zipcode">Zip Code</Label>
                                    <Input id="zipcode" name="zipcode" defaultValue={school.zipcode} required />
                                    {state.errors?.zipcode && <p className="text-sm text-destructive">{state.errors.zipcode.join(', ')}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" type="tel" defaultValue={school.phone} required />
                                     {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone.join(', ')}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="school-id">School ID</Label>
                                    <Input id="school-id" name="schoolId" value={school.schoolId} readOnly className="bg-muted"/>
                                </div>
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
