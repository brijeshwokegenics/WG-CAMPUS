
'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';

import { admitStudent, getClassesForSchool } from '@/app/actions/academics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUpload } from './FileUpload';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

const FormSchema = z.object({
  schoolId: z.string(),
  classId: z.string().min(1, "Please select a class."),
  section: z.string().min(1, "Please select a section."),
  admissionDate: z.date({ required_error: "Admission date is required."}),
  studentName: z.string().min(2, "Student name is required."),
  dob: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender."}),
  bloodGroup: z.string().optional(),
  
  fatherName: z.string().min(2, "Father's name is required."),
  motherName: z.string().min(2, "Mother's name is required."),
  parentMobile: z.string().min(10, "A valid mobile number is required.").max(15),
  parentEmail: z.string().email("Invalid email address.").optional().or(z.literal('')),
  
  address: z.string().min(5, "Address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  zipcode: z.string().min(5, "Zip code is required."),

  photoUrl: z.string().url().optional().or(z.literal('')),
  aadharUrl: z.string().url().optional().or(z.literal('')),
  birthCertificateUrl: z.string().url().optional().or(z.literal('')),

  // New Fields
  aadharNumber: z.string().optional(),
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  previousMarks: z.string().optional(),
  transportRequired: z.enum(['Yes', 'No']).optional(),
  hostelRequired: z.enum(['Yes', 'No']).optional(),
});

type FormValues = z.infer<typeof FormSchema>;
type ClassData = { id: string; name: string; sections: string[]; };

export function AdmissionForm({ schoolId }: { schoolId: string }) {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [newlyAdmittedStudent, setNewlyAdmittedStudent] = useState<any | null>(null);

  const initialState = { success: false, error: null, message: null, student: null };

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      schoolId: schoolId,
      admissionDate: new Date(),
      transportRequired: 'No',
      hostelRequired: 'No'
    }
  });

  const [state, formAction] = useFormState(admitStudent, initialState);

  useEffect(() => {
    async function fetchClasses() {
      const result = await getClassesForSchool(schoolId);
      if (result.success && result.data) {
        setClasses(result.data);
      }
    }
    fetchClasses();
  }, [schoolId]);

  const watchedClassId = watch("classId");
  useEffect(() => {
    const newSelectedClass = classes.find(c => c.id === watchedClassId) || null;
    setSelectedClass(newSelectedClass);
  }, [watchedClassId, classes]);
  
  useEffect(() => {
    if (state.success) {
      setNewlyAdmittedStudent(state.student);
      reset(); // Clear the form
    }
  }, [state, reset]);

  const onFormSubmit = (data: FormValues) => {
    setNewlyAdmittedStudent(null); // Clear previous success state before new submission
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (typeof value === 'string' && value) {
            formData.append(key, value);
        } else if (typeof value === 'boolean' || typeof value === 'number') {
            formData.append(key, String(value));
        }
    });
    formAction(formData);
  };
  
  if (newlyAdmittedStudent) {
    return (
        <Card className="bg-green-50 border-green-200">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div>
                        <CardTitle className="text-green-800">Admission Successful!</CardTitle>
                        <CardDescription className="text-green-700">
                            Student {newlyAdmittedStudent.studentName} has been admitted with ID: {newlyAdmittedStudent.id}.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm font-medium mb-2">What would you like to do next?</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => setNewlyAdmittedStudent(null)}>Admit Another Student</Button>
                    <Button variant="outline" disabled>
                        <Mail className="mr-2 h-4 w-4"/> Send Welcome Email
                    </Button>
                     <Button variant="outline" disabled>
                        <MessageSquare className="mr-2 h-4 w-4"/> Send Welcome SMS
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Note: Communication features require integration setup by a developer.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <>
     {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Admission Failed</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        {/* Academic Details */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Academic Details</legend>
          <input type="hidden" {...register("schoolId")} value={schoolId} />
          <div className="space-y-2">
            <Label>Admission Date</Label>
            <Controller name="admissionDate" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                </Popover>
              )} />
            {errors.admissionDate && <p className="text-sm text-destructive">{errors.admissionDate.message}</p>}
          </div>
          <div className="space-y-2">
             <Label>Class</Label>
             <Controller name="classId" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            {errors.classId && <p className="text-sm text-destructive">{errors.classId.message}</p>}
          </div>
          <div className="space-y-2">
             <Label>Section</Label>
             <Controller name="section" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedClass}>
                  <SelectTrigger><SelectValue placeholder="Select a section" /></SelectTrigger>
                  <SelectContent>
                    {selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
             )} />
            {errors.section && <p className="text-sm text-destructive">{errors.section.message}</p>}
          </div>
        </fieldset>

        {/* Student Details */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Student Details</legend>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input id="studentName" {...register("studentName")} />
            {errors.studentName && <p className="text-sm text-destructive">{errors.studentName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
             <Controller name="dob" control={control} render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1990} toYear={new Date().getFullYear()} initialFocus /></PopoverContent>
                </Popover>
              )} />
            {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
          </div>
           <div className="space-y-2">
            <Label>Gender</Label>
             <Controller name="gender" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
             )} />
            {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group (Optional)</Label>
            <Input id="bloodGroup" {...register("bloodGroup")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aadharNumber">Aadhar Number (Optional)</Label>
            <Input id="aadharNumber" {...register("aadharNumber")} />
          </div>
        </fieldset>

        {/* Parent Details */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-2">
          <legend className="-ml-1 px-1 text-sm font-medium">Parent/Guardian Details</legend>
          <div className="space-y-2">
            <Label htmlFor="fatherName">Father's Name</Label>
            <Input id="fatherName" {...register("fatherName")} />
            {errors.fatherName && <p className="text-sm text-destructive">{errors.fatherName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="motherName">Mother's Name</Label>
            <Input id="motherName" {...register("motherName")} />
            {errors.motherName && <p className="text-sm text-destructive">{errors.motherName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentMobile">Parent Mobile</Label>
            <Input id="parentMobile" type="tel" {...register("parentMobile")} />
            {errors.parentMobile && <p className="text-sm text-destructive">{errors.parentMobile.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentEmail">Parent Email (Optional)</Label>
            <Input id="parentEmail" type="email" {...register("parentEmail")} />
            {errors.parentEmail && <p className="text-sm text-destructive">{errors.parentEmail.message}</p>}
          </div>
        </fieldset>

        {/* Contact Details */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Contact Details</legend>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipcode">Zip Code</Label>
              <Input id="zipcode" {...register("zipcode")} />
              {errors.zipcode && <p className="text-sm text-destructive">{errors.zipcode.message}</p>}
            </div>
          </div>
        </fieldset>

        {/* Previous Academic Details */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-3">
            <legend className="-ml-1 px-1 text-sm font-medium">Previous Academic Details</legend>
            <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School (Optional)</Label>
                <Input id="previousSchool" {...register("previousSchool")} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="previousClass">Previous Class (Optional)</Label>
                <Input id="previousClass" {...register("previousClass")} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="previousMarks">Marks/Grade % (Optional)</Label>
                <Input id="previousMarks" {...register("previousMarks")} />
            </div>
        </fieldset>

        {/* Other Details */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-2">
            <legend className="-ml-1 px-1 text-sm font-medium">Other Details</legend>
            <div className="space-y-2">
                <Label>Transport Required?</Label>
                <Controller name="transportRequired" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                    </Select>
                )} />
            </div>
            <div className="space-y-2">
                <Label>Hostel Required?</Label>
                <Controller name="hostelRequired" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                        </SelectContent>
                    </Select>
                )} />
            </div>
        </fieldset>

         {/* Document Uploads */}
        <fieldset className="grid grid-cols-1 gap-6 rounded-lg border p-4 md:grid-cols-3">
            <legend className="-ml-1 px-1 text-sm font-medium">Upload Documents</legend>
             <FileUpload
                id="photoUrl"
                label="Student Photo"
                uploadPath={`/${schoolId}/student_photos`}
                onUploadComplete={(url) => setValue('photoUrl', url)}
                onFileRemove={() => setValue('photoUrl', '')}
             />
             <FileUpload
                id="aadharUrl"
                label="Aadhar Card"
                uploadPath={`/${schoolId}/aadhar_cards`}
                onUploadComplete={(url) => setValue('aadharUrl', url)}
                onFileRemove={() => setValue('aadharUrl', '')}
             />
             <FileUpload
                id="birthCertificateUrl"
                label="Birth Certificate"
                uploadPath={`/${schoolId}/birth_certificates`}
                onUploadComplete={(url) => setValue('birthCertificateUrl', url)}
                onFileRemove={() => setValue('birthCertificateUrl', '')}
             />
        </fieldset>
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Admitting Student...' : 'Admit Student'}
            </Button>
        </div>
      </form>
    </>
  );
}
