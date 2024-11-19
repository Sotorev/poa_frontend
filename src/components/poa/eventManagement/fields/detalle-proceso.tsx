// detalle-proceso.tsx

'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input" // Import Input component

interface DetalleProcesoFileWithStatus {
  id: number;
  file: File;
  isEdited: boolean;
  originalName: string;
}

interface DetalleProcesoProps {
  files: DetalleProcesoFileWithStatus[];
  onFilesChange: (files: DetalleProcesoFileWithStatus[]) => void;
}

export function DetalleProcesoComponent({ files, onFilesChange }: DetalleProcesoProps) {
  const [localFiles, setLocalFiles] = useState<DetalleProcesoFileWithStatus[]>(files || []);

  // Add useEffect to update localFiles when files prop changes
  useEffect(() => {
    setLocalFiles(files || []);
  }, [files]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        id: Date.now(),
        file,
        isEdited: true,
        originalName: file.name,
      }));
      const updatedFiles = [...localFiles, ...newFiles];
      setLocalFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map((file) => ({
        id: Date.now(),
        file,
        isEdited: true,
        originalName: file.name,
      }));
      const updatedFiles = [...localFiles, ...newFiles];
      setLocalFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const handleRemoveFile = (id: number) => {
    const updatedFiles = localFiles.filter(file => file.id !== id);
    setLocalFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload-proceso"
              className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
            >
              <span>Cargar un archivo</span>
              <Input
                id="file-upload-proceso"
                name="file-upload-proceso"
                type="file"
                className="sr-only" // Hide the input
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                multiple
              />
            </label>
            <p className="pl-1">o arrastrar y soltar</p>
          </div>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT hasta 10MB</p>
        </div>
      </div>
      {localFiles.length > 0 && (
        <div className="space-y-2">
          {localFiles.map(({ id, originalName }) => (
            <div key={id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
              <span className="text-sm text-gray-600">{originalName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
