'use client';

import { useCallback, type ReactNode } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  maxSize?: number;
  children?: ReactNode;
  className?: string;
  label?: string;
  sublabel?: string;
}

export default function FileUpload({
  onFiles,
  accept,
  multiple = false,
  maxSize = 2 * 1024 * 1024 * 1024,
  children,
  className,
  label = 'Drop files here or click to browse',
  sublabel,
}: FileUploadProps) {
  const onDrop = useCallback((files: File[]) => { onFiles(files); }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none',
        isDragActive && !isDragReject && 'border-brand-500 bg-brand-950/30',
        isDragReject && 'border-red-500 bg-red-950/20',
        !isDragActive && 'border-surface-border hover:border-brand-600 hover:bg-surface-muted/50',
        className,
      )}
    >
      <input {...getInputProps()} />
      {children ?? (
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="p-4 rounded-full bg-surface-muted">
            <Upload className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">{label}</p>
            {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
          </div>
          {isDragReject && (
            <p className="text-xs text-red-400">File type not supported</p>
          )}
        </div>
      )}
    </div>
  );
}
