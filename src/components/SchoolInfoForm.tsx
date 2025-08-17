
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateSchool, State } from '@/app/actions/school';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileUpload } from './FileUpload';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


const FormSchema = z.object({
  schoolName: z.string().min(3, "School name is required."),
  contactEmail: z.string().email("A valid email is required."),
  address: z.string().min(5, "Address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  zipcode: z.string().min(5, "Zip code is required."),
  phone: z.string().min(10, "A valid phone number is required."),
  schoolId: z.string(),
  enabled: z.boolean(),
  schoolLogoUrl: z.string().url().optional().or(z.literal('')),
  affiliationCode: z.string().optional(),
  schoolWebsite: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof FormSchema>;

export function SchoolInfoForm({ school }: { school: any }) {
  const initialState: State = { message: null, errors: {} };
  const updateSchoolWithId = updateSchool.bind(null, school.id);
  const [state, formAction] = useFormState(updateSchoolWithId, initialState);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      schoolName: school.schoolName || '',
      contactEmail: school.contactEmail || '',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      zipcode: school.zipcode || '',
      phone: school.phone || '',
      schoolId: school.schoolId,
      enabled: school.enabled,
      schoolLogoUrl: school.schoolLogoUrl || '',
      affiliationCode: school.affiliationCode || '',
      schoolWebsite: school.schoolWebsite || '',
    },
  });

  const onFormSubmit = (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    formAction(formData);
  };

  const schoolLogoUrl = watch('schoolLogoUrl');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-4xl">
      {state.message && (
        <Alert className={cn(state.errors ? "text-destructive border-destructive" : "text-green-700 border-green-500")}>
          <AlertTitle>{state.errors ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col md:flex-row items-start gap-6 border-b pb-6">
        <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border">
                <AvatarImage src={schoolLogoUrl || undefined} alt={school.schoolName} />
                <AvatarFallback>{school.schoolName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <FileUpload
                id="schoolLogoUrl"
                label="Upload School Logo"
                uploadPath={`/${school.id}/school_assets`}
                onUploadComplete={(url) => setValue('schoolLogoUrl', url)}
                onFileRemove={() => setValue('schoolLogoUrl', '')}
                initialUrl={school.schoolLogoUrl}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
            <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input id="schoolName" {...register('schoolName')} />
                {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="schoolId">School ID</Label>
                <Input id="schoolId" {...register('schoolId')} readOnly disabled className="bg-muted/50"/>
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" {...register('address')} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} />
            {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="zipcode">Zip Code</Label>
            <Input id="zipcode" {...register('zipcode')} />
            {errors.zipcode && <p className="text-sm text-destructive">{errors.zipcode.message}</p>}
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input id="contactEmail" type="email" {...register('contactEmail')} />
            {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="affiliationCode">Affiliation Code (Optional)</Label>
            <Input id="affiliationCode" {...register('affiliationCode')} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="schoolWebsite">School Website (Optional)</Label>
            <Input id="schoolWebsite" type="url" {...register('schoolWebsite')} />
            {errors.schoolWebsite && <p className="text-sm text-destructive">{errors.schoolWebsite.message}</p>}
        </div>
      </div>

      <input type="hidden" {...register('enabled')} />

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Save Changes
        </Button>
      </div>
    </form>
  );
}
