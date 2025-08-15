
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateSchoolPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Create New School</h1>
      <Card>
        <CardHeader>
          <CardTitle>School Details</CardTitle>
          <CardDescription>Fill in the form below to register a new school in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
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
                    <Input id="school-id" value="Generating..." readOnly />
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
