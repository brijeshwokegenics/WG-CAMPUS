
'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateSchool, State } from '@/app/actions/school';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
});

type FormValues = z.infer<typeof FormSchema>;

export function SchoolInfoForm({ school }: { school: any }) {
  const initialState: State = { message: null, errors: {} };
  const updateSchoolWithId = updateSchool.bind(null, school.id);
  const [state, formAction] = useFormState(updateSchoolWithId, initialState);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
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
    },
  });

  const onFormSubmit = (data: FormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
    });
    formAction(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-w-3xl">
      {state.message && (
        <Alert className={cn(state.errors ? "text-destructive border-destructive" : "text-green-700 border-green-500")}>
          <AlertTitle>{state.errors ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="schoolName">School Name</Label>
          <Input id="schoolName" {...register('schoolName')} />
          {errors.schoolName && <p className="text-sm text-destructive">{errors.schoolName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="schoolId">School ID</Label>
          <Input id="schoolId" {...register('schoolId')} readOnly disabled className="bg-muted/50"/>
        </div>
      </div>
       <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input id="address" {...register('address')} />
        {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
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
