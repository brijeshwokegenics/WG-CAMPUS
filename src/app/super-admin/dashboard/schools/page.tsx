import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { readDb } from "@/app/actions/school";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default async function ManageSchoolsPage() {
  const { schools } = await readDb();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Schools</h1>
          <p className="text-muted-foreground">View, edit, and update the status of registered schools.</p>
        </div>
        <Link href="/super-admin/dashboard/create-school">
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New School
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Schools</CardTitle>
          <CardDescription>A complete list of all schools in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {schools && schools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>School ID</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school: any) => (
                  <TableRow key={school.schoolId}>
                    <TableCell className="font-medium">{school.schoolName}</TableCell>
                    <TableCell>{school.schoolId}</TableCell>
                    <TableCell>{school.contactEmail}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${school.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {school.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </TableCell>
                     <TableCell>
                        {/* Action dropdown to be implemented */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No schools have been created yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
