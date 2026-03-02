'use client';

import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  hint?: string;
}

export function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  className,
  label,
  hint,
}: FileDropzoneProps) {
  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const reasons = new Set<string>();
    for (const r of rejections) {
      for (const e of r.errors) {
        if (e.code === 'file-too-large') reasons.add('File too large');
        else if (e.code === 'file-invalid-type') reasons.add('Unsupported file type');
        else if (e.code === 'too-many-files') reasons.add('Too many files');
        else reasons.add(e.message);
      }
    }
    toast.error([...reasons].join('. '));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFiles,
    onDropRejected,
    accept,
    multiple,
    maxSize,
    maxFiles,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      role="button"
      aria-label="Upload file"
      className={cn(
        'flex min-h-[140px] sm:min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-4 sm:p-8 text-center transition-colors',
        isDragActive && 'border-foreground/40 bg-muted/50',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <input {...getInputProps({ 'aria-label': label ?? 'Upload file' })} />
      <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-sm font-medium">{label ?? <><span className="hidden sm:inline">Drop files here or click to browse</span><span className="sm:hidden">Tap to select files</span></>}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
