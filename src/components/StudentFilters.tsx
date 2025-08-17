
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from './ui/input';
import { Combobox } from './ui/combobox';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import React from 'react';

type ClassData = { id: string; name: string; sections: string[]; };

export function StudentFilters({ classes }: { classes: ClassData[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const classOptions = classes.map(c => ({ label: c.name, value: c.id }));
  const selectedClassId = searchParams.get('classId') || '';
  const selectedClass = React.useMemo(() => classes.find(c => c.id === selectedClassId), [classes, selectedClassId]);

  const handleSearch = (key: 'name' | 'admissionId' | 'classId' | 'section', value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === 'classId' && !value) {
        params.delete('section');
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
            className="w-full md:w-auto md:flex-grow"
            placeholder="Search by student name..."
            onChange={(e) => debouncedSearch('name', e.target.value)}
            defaultValue={searchParams.get('name')?.toString()}
        />
        <Input
            className="w-full md:w-auto md:flex-grow"
            placeholder="Search by admission ID..."
            onChange={(e) => debouncedSearch('admissionId', e.target.value)}
            defaultValue={searchParams.get('admissionId')?.toString()}
        />
        <Combobox
            options={classOptions}
            value={selectedClassId}
            onChange={(value) => handleSearch('classId', value)}
            placeholder="Filter by class..."
            searchPlaceholder="Search for class..."
            className="w-full md:w-[200px]"
        />
        <Select
            value={searchParams.get('section') || ''}
            onValueChange={(value) => handleSearch('section', value)}
            disabled={!selectedClass}
        >
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
                {selectedClass?.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
        </Select>
        {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <X className="mr-2 h-4 w-4" />
                Clear Filters
            </Button>
        )}
    </div>
  );
}
