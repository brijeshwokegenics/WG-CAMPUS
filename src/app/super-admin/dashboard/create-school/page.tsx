
'use client';

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { createSchool, State } from "@/app/actions/school";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? 'Creating School...' : 'Create School & Generate Credentials'}
    </Button>
  );
}

export default function CreateSchoolPage() {
  const [schoolId, setSchoolId] = useState("");
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createSchool, initialState);

  useEffect(() => {
    // Generate ID on the client side to avoid hydration mismatch
    const generatedId = `SCH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setSchoolId(generatedId);
  }, []);

  useEffect(() => {
    if (state?.message === "School created successfully!") {
        setTimeout(() => {
             window.location.href = "/super-admin/dashboard/schools";
        }, 1500);
    }
  }, [state]);

  const hasAnyError = state?.message && state.message !== "School created successfully!";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-4xl">
        <Link
          href="/super-admin/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a New School Account</CardTitle>
            <CardDescription>
              Fill in the form below to register a new school in the system. A unique School ID will be generated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.message && (
              <div
                className={`mb-4 flex items-start gap-2 rounded-md border p-3 text-sm ${
                  state.message === "School created successfully!"
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-red-300 bg-red-50 text-red-800"
                }`}
              >
                {state.message === "School created successfully!" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{state.message}</span>
              </div>
            )}

            <form action={dispatch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name</Label>
                  <Input id="school-name" name="schoolName" placeholder="e.g., Northwood High School" required aria-invalid={!!state.errors?.schoolName} />
                  {state.errors?.schoolName && (
                    <p className="text-sm text-destructive">{state.errors.schoolName.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" name="contactEmail" type="email" placeholder="e.g., contact@northwoodhigh.edu" required aria-invalid={!!state.errors?.contactEmail} />
                  {state.errors?.contactEmail && (
                    <p className="text-sm text-destructive">{state.errors.contactEmail.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="e.g., 123 Education Lane" required aria-invalid={!!state.errors?.address} />
                {state.errors?.address && (
                  <p className="text-sm text-destructive">{state.errors.address.join(", ")}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="e.g., Springfield" required aria-invalid={!!state.errors?.city} />
                  {state.errors?.city && (
                    <p className="text-sm text-destructive">{state.errors.city.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" placeholder="e.g., Illinois" required aria-invalid={!!state.errors?.state} />
                  {state.errors?.state && (
                    <p className="text-sm text-destructive">{state.errors.state.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipcode">Zip Code</Label>
                  <Input id="zipcode" name="zipcode" placeholder="e.g., 62704" required aria-invalid={!!state.errors?.zipcode} />
                  {state.errors?.zipcode && (
                    <p className="text-sm text-destructive">{state.errors.zipcode.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="e.g., (555) 123-4567" required aria-invalid={!!state.errors?.phone} />
                  {state.errors?.phone && (
                    <p className="text-sm text-destructive">{state.errors.phone.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-id">Generated School ID</Label>
                  <Input id="school-id" name="schoolId" value={schoolId} readOnly className="bg-muted" aria-invalid={!!state.errors?.schoolId} />
                   {state.errors?.schoolId && (
                    <p className="text-sm text-destructive">{state.errors.schoolId.join(", ")}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password">Set Password</Label>
                  <Input id="password" name="password" type="password" required aria-invalid={!!state.errors?.password} />
                  {state.errors?.password && (
                    <p className="text-sm text-destructive">{state.errors.password.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" name="confirmPassword" type="password" required aria-invalid={!!state.errors?.confirmPassword} />
                  {state.errors?.confirmPassword && (
                    <p className="text-sm text-destructive">{state.errors.confirmPassword.join(", ")}</p>
                  )}
                </div>
              </div>

              {hasAnyError && Object.keys(state.errors || {}).length > 0 && !state.message?.startsWith("Please fix") && (
                <p className="text-sm text-destructive text-center">
                  Please fix the highlighted fields and try again.
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
