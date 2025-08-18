
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsersForSchool } from "@/app/actions/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

async function StaffList({ schoolId }: { schoolId: string }) {
    const { success, data: users } = await getUsersForSchool(schoolId);
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {success && users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} alt={user.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="font-mono text-xs">{user.userId}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No staff members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
    );
}

function StaffListSkeleton() {
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]"><Skeleton className="h-5 w-12" /></TableHead>
                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                <TableHead><Skeleton className="h-5 w-36" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
    )
}

export default async function StaffDirectoryPage({ params }: { params: { id: string } }) {
  const schoolId = params.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
        <p className="text-muted-foreground">
          A complete directory of all staff members in the school.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Staff</CardTitle>
          <CardDescription>
            Contact information and roles for all school staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<StaffListSkeleton />}>
            <StaffList schoolId={schoolId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
