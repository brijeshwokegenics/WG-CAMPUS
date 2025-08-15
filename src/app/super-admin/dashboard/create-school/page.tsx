
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateSchoolPage() {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Generate a unique school ID when the component mounts
    const generatedId = `SCH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setSchoolId(generatedId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // In a real application, you would send this data to your backend/database
    const schoolData = {
      schoolName: (document.getElementById('school-name') as HTMLInputElement).value,
      contactEmail: (document.getElementById('contact-email') as HTMLInputElement).value,
      address: (document.getElementById('address') as HTMLInputElement).value,
      city: (document.getElementById('city') as HTMLInputElement).value,
      state: (document.getElementById('state') as HTMLInputElement).value,
      zipcode: (document.getElementById('zipcode') as HTMLInputElement).value,
      phone: (document.getElementById('phone') as HTMLInputElement).value,
      schoolId,
      password,
    };
    console.log("Creating school with data:", schoolData);
    alert(`School created successfully!\nSchool ID: ${schoolId}`);
    // Potentially redirect back to dashboard
    // window.location.href = '/super-admin/dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-4xl">
             <Link href="/super-admin/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl">Create a New School Account</CardTitle>
                <CardDescription>Fill in the form below to register a new school in the system. A unique School ID will be generated automatically.</CardDescription>
                </CardHeader>
                <CardContent>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="school-name">School Name</Label>
                        <Input id="school-name" placeholder="e.g., Northwood High School" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact-email">Contact Email</Label>
                        <Input id="contact-email" type="email" placeholder="e.g., contact@northwoodhigh.edu" required />
                    </div>
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="e.g., 123 Education Lane" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="e.g., Springfield" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="e.g., Illinois" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zipcode">Zip Code</Label>
                        <Input id="zipcode" placeholder="e.g., 62704" required />
                    </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="e.g., (555) 123-4567" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="school-id">Generated School ID</Label>
                            <Input id="school-id" value={schoolId} readOnly className="bg-muted"/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">Set Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" size="lg" className="w-full">
                            Create School & Generate Credentials
                        </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
