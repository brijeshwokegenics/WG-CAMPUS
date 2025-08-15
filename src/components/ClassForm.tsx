
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClass, updateClass } from '@/app/actions/academics';
import { Trash, PlusCircle } from 'lucide-react';

const ClassFormSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  sections: z.array(z.object({ name: z.string().min(1, 'Section name cannot be empty') })).min(1, 'At least one section is required'),
});

type ClassFormValues = z.infer<typeof ClassFormSchema>;

type ClassData = {
  id: string;
  name: string;
  sections: string[];
};

type ClassFormProps = {
  schoolId: string;
  classData?: ClassData | null;
  onSuccess: () => void;
};

export function ClassForm({ schoolId, classData, onSuccess }: ClassFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClassFormValues>({
    resolver: zodResolver(ClassFormSchema),
    defaultValues: {
      name: classData?.name || '',
      sections: classData?.sections.map(name => ({ name })) || [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const action = classData ? updateClass : createClass;
  const [state, formAction] = useFormState(action, { success: false, error: null });

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
    if (state.error) {
        setFormError(state.error);
    }
  }, [state, onSuccess]);
  
  const handleFormSubmit = (data: ClassFormValues) => {
    setFormError(null);
    const formData = new FormData();
    formData.append('name', data.name);
    data.sections.forEach(section => formData.append('sections', section.name));
    formData.append('schoolId', schoolId);
    if (classData) {
        formData.append('classId', classData.id);
    }
    formAction(formData);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Class Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Sections</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              {...register(`sections.${index}.name`)}
              placeholder={`Section ${String.fromCharCode(65 + index)}`}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
         {errors.sections && (
            <p className="text-sm text-destructive">{errors.sections.message || errors.sections.root?.message}</p>
        )}
        {errors.sections?.map((sectionError, index) => (
           sectionError.name && <p key={index} className="text-sm text-destructive">{sectionError.name.message}</p>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '' })}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>
      
       {formError && (
          <p className="text-sm text-destructive text-center">{formError}</p>
        )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Class'}
      </Button>
    </form>
  );
}
