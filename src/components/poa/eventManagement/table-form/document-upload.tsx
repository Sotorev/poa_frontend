"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon, Cross2Icon, FileTextIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  name: string;
  maxFiles: number;
  label: string;
  onFilesChange?: (files: File[]) => void;
  resetKey?: number;
}

export function DocumentUpload({ name, maxFiles, label, onFilesChange, resetKey }: DocumentUploadProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(files);
    }
  }, [files, onFilesChange]);

  useEffect(() => {
    if (resetKey !== undefined) {
      setFiles([]);
    }
  }, [resetKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const totalFiles = [...files, ...newFiles];
    
    if (totalFiles.length > maxFiles) {
      toast({
        title: "Límite de archivos excedido",
        description: `Solo se permiten un máximo de ${maxFiles} archivos.`,
        variant: "destructive",
      });
      return;
    }
    
    setFiles(totalFiles);
    
    // Reset the input so the same file can be selected again if needed
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <small className="text-gray-500">{label}</small>
        <small className="text-gray-500">
          {files.length} / {maxFiles}
        </small>
      </div>
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div 
            key={`${file.name}-${index}`}
            className="bg-gray-50 p-2 rounded flex items-center justify-between text-sm"
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              <FileTextIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{file.name}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => removeFile(index)}
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <input
          type="file"
          id={name}
          name={name}
          onChange={handleFileChange}
          className="hidden"
          multiple
          ref={inputRef}
        />
        <label 
          htmlFor={name}
          className={`
            inline-flex items-center justify-center px-3 py-1.5 text-xs 
            rounded border border-dashed cursor-pointer
            ${files.length >= maxFiles 
              ? 'text-gray-400 border-gray-300 bg-gray-50' 
              : 'text-blue-600 border-blue-300 hover:bg-blue-50'
            }
          `}
        >
          <UploadIcon className="h-3.5 w-3.5 mr-1" />
          {files.length === 0 
            ? 'Subir archivos' 
            : files.length >= maxFiles 
              ? 'Máximo alcanzado' 
              : 'Agregar más'}
        </label>
      </div>
    </div>
  );
} 