// src/components/poa/components/columns/detalle.tsx
'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface DetalleProps {
  files: FileWithId[]
  onFilesChange: (files: FileWithId[]) => void
}

// Define an interface for files with an id
interface FileWithId {
  id: number
  file: File
}

export function DetalleComponent({ files, onFilesChange }: DetalleProps) {
  const [localFiles, setLocalFiles] = useState<FileWithId[]>(files || [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalFiles(files || [])
  }, [files])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: Date.now(), // Use a function or method to generate a unique id
        file,
      }))
      const updatedFiles = [...localFiles, ...newFiles]
      setLocalFiles(updatedFiles)
      onFilesChange(updatedFiles)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        id: Date.now(), // Use a function or method to generate a unique id
        file,
      }))
      const updatedFiles = [...localFiles, ...newFiles]
      setLocalFiles(updatedFiles)
      onFilesChange(updatedFiles)
    }
  }

  const handleRemoveFile = (id: number) => {
    const updatedFiles = localFiles.filter(f => f.id !== id)
    setLocalFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

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
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
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
      {localFiles.length > 0 && (
        <div className="space-y-2">
          {localFiles.map(({ id, file }) => (
            <div key={id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
              <span className="text-sm text-gray-600">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(id)}
                className="text-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}