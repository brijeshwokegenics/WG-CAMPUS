
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School } from "lucide-react";
import Link from "next/link";
import { loginSchool, LoginState } from '@/app/actions/auth';
import { useEffect } from 'react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full mt-6" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}


export default function SchoolLoginPage() {
  const initialState: LoginState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(loginSchool, initialState);
  
   useEffect(() => {
    if (state?.message && state.message.startsWith('This school account has been disabled')) {
        alert(`Error: ${state.message}`);
    }
  }, [state]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <School size={48} className="text-primary"/>
          </div>
          <CardTitle className="text-3xl font-bold">School Portal Login</CardTitle>
          <CardDescription>Login as a Director, Principal, or Staff.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-id">School ID</Label>
              <Input id="school-id" name="schoolId" placeholder="Enter your School ID" required />
               {state.errors?.schoolId && <p className="text-sm text-destructive">{state.errors.schoolId.join(', ')}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
            </div>
            {state.message && !state.errors && <p className="text-sm text-destructive text-center">{state.message}</p>}
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline">
              Back to main portal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
