
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from './ui/input';
import { Combobox } from './ui/combobox';
import { Button } from './ui/button';
import { X } from 'lucide-react';

type ClassData = { id: string; name: string; sections: string[]; };

export function StudentFilters({ classes }: { classes: ClassData[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const classOptions = classes.map(c => ({ label: c.name, value: c.id }));

  const handleSearch = (key: 'name' | 'admissionId' | 'classId', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const debouncedSearch = useDebouncedCallback(handleSearch, 400);

  const clearFilters = () => {
    replace(pathname);
  };
  
  const hasActiveFilters = searchParams.get('name') || searchParams.get('admissionId') || searchParams.get('classId');

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
        <Input
            className="max-w-sm"
            placeholder="Search by student name..."
            onChange={(e) => debouncedSearch('name', e.target.value)}
            defaultValue={searchParams.get('name')?.toString()}
        />
        <Input
            className="max-w-sm"
            placeholder="Search by admission ID..."
            onChange={(e) => debouncedSearch('admissionId', e.target.value)}
            defaultValue={searchParams.get('admissionId')?.toString()}
        />
        <Combobox
            options={classOptions}
            value={searchParams.get('classId') || ''}
            onChange={(value) => handleSearch('classId', value)}
            placeholder="Filter by class..."
            searchPlaceholder="Search for class..."
            className="w-full md:w-[200px]"
        />
        {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <X className="mr-2 h-4 w-4" />
                Clear Filters
            </Button>
        )}
    </div>
  );
}
