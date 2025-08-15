
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { getStudentsForSchool } from '@/app/actions/academics';
import { Button } from './ui/button';


export async function StudentList({ schoolId, query }: { schoolId: string, query: string }) {
    const students = await getStudentsForSchool(schoolId, query);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Admission ID</TableHead>
          <TableHead>Student Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Father's Name</TableHead>
          <TableHead>Mobile Number</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length > 0 ? (
          students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-mono text-xs">{student.id}</TableCell>
              <TableCell className="font-medium">{student.studentName}</TableCell>
              <TableCell>{student.className} - {student.section}</TableCell>
              <TableCell>{student.fatherName}</TableCell>
              <TableCell>{student.parentMobile}</TableCell>
              <TableCell className="text-right">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                       <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                       </DropdownMenuItem>
                       <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Student
                       </DropdownMenuItem>
                       <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24">
              No students found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
