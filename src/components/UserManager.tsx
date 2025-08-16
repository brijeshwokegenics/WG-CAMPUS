
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormState } from 'react-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MoreHorizontal, Loader2, Pencil, Trash2, KeyRound } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';

import { createUser, getUsersForSchool, updateUser, deleteUser, updateUserPassword } from '@/app/actions/users';

const UserRole = z.enum(["Teacher", "Accountant", "Librarian", "Admin", "Principal"]);

const BaseUserSchema = z.object({
  name: z.string().min(2, 'User name must be at least 2 characters.'),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  phone: z.string().min(10, "A valid 10-digit mobile number is required."),
  role: UserRole,
  enabled: z.boolean().default(true),
});

const AddUserFormSchema = BaseUserSchema.extend({
  userId: z.string().min(3, 'User ID must be at least 3 characters.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const UpdateUserFormSchema = BaseUserSchema;

type User = z.infer<typeof BaseUserSchema> & { id: string, userId: string };

type AddUserFormValues = z.infer<typeof AddUserFormSchema>;
type UpdateUserFormValues = z.infer<typeof UpdateUserFormSchema>;


export function UserManager({ schoolId }: { schoolId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getUsersForSchool(schoolId);
    if (result.success && result.data) {
      setUsers(result.data as User[]);
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [schoolId]);

  const handleFormSuccess = () => {
    setIsAddUserDialogOpen(false);
    setIsEditUserDialogOpen(false);
    fetchUsers();
  };
  
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };
  
  const handleDeleteClick = (user: User) => {
     if (confirm(`Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`)) {
        startTransition(async () => {
            await deleteUser({ userId: user.id, schoolId });
            fetchUsers();
        });
    }
  };

  const handlePasswordClick = (user: User) => {
    setEditingUser(user);
    setIsPasswordDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                <Pencil className="mr-2 h-4 w-4"/> Edit Details
                             </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePasswordClick(user)}>
                                <KeyRound className="mr-2 h-4 w-4"/> Change Password
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found. Click "Add New User" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {isAddUserDialogOpen && <AddUserDialog isOpen={isAddUserDialogOpen} setIsOpen={setIsAddUserDialogOpen} schoolId={schoolId} onSuccess={handleFormSuccess} />}
      {isEditUserDialogOpen && editingUser && <EditUserDialog isOpen={isEditUserDialogOpen} setIsOpen={setIsEditUserDialogOpen} schoolId={schoolId} user={editingUser} onSuccess={handleFormSuccess} />}
      {isPasswordDialogOpen && editingUser && <UpdatePasswordDialog isOpen={isPasswordDialogOpen} setIsOpen={setIsPasswordDialogOpen} schoolId={schoolId} user={editingUser} />}

    </div>
  );
}


// Add User Dialog
function AddUserDialog({ isOpen, setIsOpen, schoolId, onSuccess }: { isOpen: boolean, setIsOpen: (val: boolean) => void, schoolId: string, onSuccess: () => void}) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<AddUserFormValues>({
        resolver: zodResolver(AddUserFormSchema),
    });
    const [state, formAction] = useFormState(createUser, { success: false, error: null });

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state, onSuccess]);

    const onFormSubmit = (data: AddUserFormValues) => {
        const formData = new FormData();
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]) => formData.append(key, value as string));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new staff account with a specific role.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email (Optional)</Label>
                            <Input id="email" type="email" {...register('email')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" {...register('phone')} />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Controller name="role" control={control} render={({ field }) => (
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Principal">Principal</SelectItem>
                                    <SelectItem value="Teacher">Teacher</SelectItem>
                                    <SelectItem value="Accountant">Accountant</SelectItem>
                                    <SelectItem value="Librarian">Librarian</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                    </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="userId">User ID (for login)</Label>
                            <Input id="userId" {...register('userId')} />
                            {errors.userId && <p className="text-sm text-destructive">{errors.userId.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                     </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Create User
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Edit User Dialog
function EditUserDialog({ isOpen, setIsOpen, schoolId, user, onSuccess }: { isOpen: boolean, setIsOpen: (val: boolean) => void, schoolId: string, user: User, onSuccess: () => void}) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<UpdateUserFormValues>({
        resolver: zodResolver(UpdateUserFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            enabled: user.enabled,
        }
    });
    const [state, formAction] = useFormState(updateUser, { success: false, error: null });

    useEffect(() => {
        if (state.success) {
            onSuccess();
        }
    }, [state, onSuccess]);

    const onFormSubmit = (data: UpdateUserFormValues) => {
        const formData = new FormData();
        formData.append('userId', user.id); // pass the document id
        formData.append('schoolId', schoolId);
        Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));
        formAction(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User: {user.name}</DialogTitle>
                    <DialogDescription>Update the details for this staff account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                    {state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                        <Label>Login User ID</Label>
                        <Input value={user.userId} disabled />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name_edit">Full Name</Label>
                        <Input id="name_edit" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email_edit">Email (Optional)</Label>
                            <Input id="email_edit" type="email" {...register('email')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone_edit">Phone Number</Label>
                            <Input id="phone_edit" type="tel" {...register('phone')} />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <div className="space-y-2">
                            <Label htmlFor="role_edit">Role</Label>
                            <Controller name="role" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Principal">Principal</SelectItem>
                                        <SelectItem value="Teacher">Teacher</SelectItem>
                                        <SelectItem value="Accountant">Accountant</SelectItem>
                                        <SelectItem value="Librarian">Librarian</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                        </div>
                         <div className="flex items-center space-x-2 pt-6">
                            <Controller name="enabled" control={control} render={({ field }) => (
                                 <Switch id="enabled" checked={field.value} onCheckedChange={field.onChange} />
                             )} />
                            <Label htmlFor="enabled">User Enabled</Label>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Update Password Dialog
function UpdatePasswordDialog({ isOpen, setIsOpen, schoolId, user }: { isOpen: boolean, setIsOpen: (val: boolean) => void, schoolId: string, user: User }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async () => {
        setError('');
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        startTransition(async () => {
            const result = await updateUserPassword(user.id, schoolId, password);
            if (result.success) {
                setIsOpen(false);
            } else {
                setError(result.error || 'Failed to update password.');
            }
        });
    };

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Password for {user.name}</DialogTitle>
                    <DialogDescription>Enter and confirm a new password for the user.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input id="new_password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input id="confirm_password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Update Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
