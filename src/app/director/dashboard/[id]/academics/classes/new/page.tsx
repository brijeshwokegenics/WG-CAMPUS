
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClass, ClassState } from '@/app/actions/academics';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Creating Class...' : 'Create Class'}
    </Button>
  );
}

export default function NewClassPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;
  const initialState: ClassState = { message: null, errors: {} };
  const createClassWithSchoolId = createClass.bind(null, schoolId);
  const [state, dispatch] = useFormState(createClassWithSchoolId, initialState);

  return (
    <div className="w-full max-w-2xl mx-auto">
        <Link href={`/director/dashboard/${schoolId}/academics/classes`} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
        </Link>
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Add a New Class</CardTitle>
                <CardDescription>Fill in the details for the new class and section.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Class Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Class 10, Grade 5" required />
                        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Input id="section" name="section" placeholder="e.g., A, Blue Jays" required />
                        {state.errors?.section && <p className="text-sm text-destructive">{state.errors.section.join(', ')}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="teacher">Class Teacher</Label>
                        <Input id="teacher" name="teacher" placeholder="e.g., Mr. John Doe" required />
                        {state.errors?.teacher && <p className="text-sm text-destructive">{state.errors.teacher.join(', ')}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="studentCount">Number of Students</Label>
                        <Input id="studentCount" name="studentCount" type="number" defaultValue="0" required />
                        {state.errors?.studentCount && <p className="text-sm text-destructive">{state.errors.studentCount.join(', ')}</p>}
                    </div>

                    {state.message && !state.errors && (
                        <p className="text-sm text-destructive text-center">{state.message}</p>
                    )}

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
