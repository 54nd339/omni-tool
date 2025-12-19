import { useState, useCallback } from 'react';
import { formatErrorMessage } from '@/app/lib/utils';
import type { FileUploadOptions, FileUploadResult } from '@/app/lib/types';

export function useFileUpload<T = File>(options: FileUploadOptions<T> = {}): FileUploadResult<T> {
  const {
    accept,
    maxFiles = 1,
    validator,
    onFileSelected,
    onFilesSelected,
    transformFile,
  } = options;

  const [file, setFile] = useState<T | null>(null);
  const [files, setFiles] = useState<T[]>([]);
  const [error, setError] = useState('');

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Type validation
      if (accept) {
        const acceptArray = Array.isArray(accept)
          ? accept
          : accept.split(',').map(s => s.trim());

        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        const matches = acceptArray.some((pattern) => {
          if (pattern.includes('*')) {
            const baseType = pattern.split('/')[0];
            return fileType.startsWith(baseType + '/');
          }
          return fileType === pattern || fileName.endsWith(pattern.replace('.', ''));
        });

        if (!matches) {
          return {
            valid: false,
            error: `File type not supported. Accepted: ${acceptArray.join(', ')}`,
          };
        }
      }

      // Custom validator
      if (validator) {
        return validator(file);
      }

      return { valid: true };
    },
    [accept, validator]
  );

  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) {
        setError('No files selected');
        return;
      }

      if (selectedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
        return;
      }

      setError('');

      try {
        if (maxFiles === 1) {
          // Single file mode
          const selectedFile = selectedFiles[0];
          const validation = validateFile(selectedFile);

          if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            setFile(null);
            return;
          }

          // Transform file if needed
          let processedFile: T;
          if (transformFile) {
            processedFile = await transformFile(selectedFile);
          } else if (onFileSelected) {
            const result = await onFileSelected(selectedFile);
            processedFile = result as T;
          } else {
            processedFile = selectedFile as T;
          }

          setFile(processedFile);
          setFiles([processedFile]);
        } else {
          // Multiple files mode
          const validFiles: File[] = [];
          const errors: string[] = [];

          for (const selectedFile of selectedFiles) {
            const validation = validateFile(selectedFile);
            if (validation.valid) {
              validFiles.push(selectedFile);
            } else {
              errors.push(`${selectedFile.name}: ${validation.error || 'Invalid file'}`);
            }
          }

          if (errors.length > 0) {
            setError(errors.join('; '));
          }

          if (validFiles.length > 0) {
            // Transform files if needed
            let processedFiles: T[];
            if (transformFile) {
              processedFiles = await Promise.all(validFiles.map((f) => transformFile(f)));
            } else if (onFilesSelected) {
              const result = await onFilesSelected(validFiles);
              processedFiles = result as T[];
            } else {
              processedFiles = validFiles as T[];
            }

            setFiles(processedFiles);
            if (processedFiles.length === 1) {
              setFile(processedFiles[0]);
            }
          }
        }
      } catch (err) {
        setError(formatErrorMessage(err, 'Failed to process files'));
      }
    },
    [maxFiles, validateFile, transformFile, onFileSelected, onFilesSelected]
  );

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const clearFiles = useCallback(() => {
    setFile(null);
    setFiles([]);
    setError('');
  }, []);

  return {
    file,
    files,
    error,
    handleFilesSelected,
    clearError,
    clearFiles,
  };
}
