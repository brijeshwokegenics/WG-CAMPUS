
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Create New School</h1>
      <Card>
        <CardHeader>
          <CardTitle>School Details</CardTitle>
          <CardDescription>Fill in the form below to register a new school in the system.</CardDescription>
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
                    <Input id="school-id" value={schoolId} readOnly />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full md:w-auto">
              Create School & Generate Credentials
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
