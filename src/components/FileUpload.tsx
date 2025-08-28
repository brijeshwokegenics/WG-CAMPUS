
'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, X, File as FileIcon } from 'lucide-react';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/upload';

interface FileUploadProps extends Omit<InputProps, 'onChange' | 'value' | 'type'> {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: Error) => void;
  onFileRemove?: () => void;
  uploadPath: string;
  label: string;
  initialUrl?: string | null;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onUploadComplete, onUploadError, onFileRemove, uploadPath, label, initialUrl, ...props }, ref) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl || null);
    
    // Sync state if the initialUrl prop changes from the parent
    useEffect(() => {
        setUploadedUrl(initialUrl || null);
    }, [initialUrl]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setUploading(true);
        setError(null);
        
        try {
          const finalPath = `${uploadPath}/${Date.now()}_${selectedFile.name}`;
          const url = await uploadFile(selectedFile, finalPath);

          setUploadedUrl(url);
          onUploadComplete(url);
        } catch (err) {
          const e = err as Error;
          setError(e.message);
          if (onUploadError) {
            onUploadError(e);
          }
        } finally {
          setUploading(false);
        }
      }
    };

    const handleRemove = () => {
        setUploadedUrl(null);
        setError(null);
        if (onFileRemove) {
            onFileRemove();
        }
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id}>{label}</Label>
        {uploadedUrl && !uploading ? (
            <div className="flex items-center justify-between p-6 border rounded-md bg-muted/50">
                <div className='flex items-center gap-2'>
                    <FileIcon className='h-5 w-5 text-muted-foreground' />
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline truncate max-w-[150px]">
                        View File
                    </a>
                </div>
                <Button type='button' variant='ghost' size='icon' onClick={handleRemove} className='h-6 w-6'>
                    <X className='h-4 w-4 text-destructive'/>
                </Button>
            </div>
        ) : (
             <div className="flex items-center gap-2">
                <Input
                    id={props.id}
                    type="file"
                    onChange={handleFileChange}
                    ref={ref}
                    disabled={uploading}
                    className={cn(
                        "file:mr-4 p-16 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90",
                        "cursor-pointer"
                    )}
                    {...props}
                />
                {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
            </div>
        )}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
