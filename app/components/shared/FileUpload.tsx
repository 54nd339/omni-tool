import { type FC, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { FileUploadProps } from '@/app/lib/types';

export const FileUpload: FC<FileUploadProps> = ({
  label,
  accept = '*',
  multiple = false,
  onFilesSelected,
  className,
}) => {
  const acceptObj = useMemo(() => {
    if (accept === '*') return undefined;

    const types = accept.split(',').map((t) => t.trim());
    const result: Record<string, string[]> = {};

    types.forEach((type) => {
      result[type] = [];
    });

    return result;
  }, [accept]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesSelected,
    multiple,
    accept: acceptObj,
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500',
          className,
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {isDragActive ? 'Drop files here...' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{accept === '*' ? 'Any file type' : accept}</p>
      </div>
    </div>
  );
};
