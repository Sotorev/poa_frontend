'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { randomUUID } from "crypto"

interface DetalleProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

// Define an interface for files with an id
interface FileWithId {
  id: number
  file: File
}

export function EventCostDetail({ files, onFilesChange }: DetalleProps) {
  const [localFiles, setLocalFiles] = useState<FileWithId[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to generate unique IDs
  const generateUniqueId = () => {
    return Date.now() + Math.random() * 1000;
  };

  useEffect(() => {
    if (!files) return;
    
    const filesWithId = files.map((file, index) => ({
      id: generateUniqueId(),
      file,
    }));
    setLocalFiles(filesWithId);
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: generateUniqueId(),
        file,
      }));
      const updatedFiles = [...localFiles, ...newFiles];
      setLocalFiles(updatedFiles);
      onFilesChange(updatedFiles.map(f => f.file));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDragAndDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        id: generateUniqueId(),
        file,
      }))
      const updatedFiles = [...(localFiles || []), ...newFiles] // Ensure localFiles is not null or undefined
      setLocalFiles(updatedFiles)
      onFilesChange(updatedFiles.map(f => f.file))
    }
  }

  const handleRemoveFile = async (id: number) => {
    try {
      const updatedFiles = localFiles.filter(f => f.id !== id);
      setLocalFiles(updatedFiles);
      onFilesChange(updatedFiles.map(f => f.file));
      // Después de eliminar exitosamente: toast.success('Archivo eliminado correctamente');
    } catch (error) {
      // En caso de error: toast.error('Error al eliminar el archivo');
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
        onDragOver={handleDragOver}
        onDrop={handleDragAndDrop}
      >
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:underline  focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
            >
              <span>Cargar un archivo</span>
              <Input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
              />
            </label>
            <p className="pl-1">o arrastrar y soltar</p>
          </div>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX hasta 10MB</p>
        </div>
      </div>
      {localFiles?.length > 0 && (
        <div className="space-y-2">
          {localFiles.map(({ id, file }) => (
            <div key={id} className="flex items-center justify-between bg-primary/10 p-2 rounded-md">
              <span className="text-sm text-primary">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(id)}
                className="text-destructive hover:text-red-800"
              >
                <X className="h-4 w-4 hover:text-red-800" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}