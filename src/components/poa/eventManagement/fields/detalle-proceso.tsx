'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DetalleProcesoProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

interface FileWithId {
  id: number
  file: File
}

export function DetalleProcesoComponent({ files, onFilesChange }: DetalleProcesoProps) {
  const [localFiles, setLocalFiles] = useState<FileWithId[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to generate unique IDs
  const generateUniqueId = () => {
    return Date.now() + Math.random() * 1000
  }

  useEffect(() => {
    if (!files) return
    
    const filesWithId = files.map((file) => ({
      id: generateUniqueId(),
      file,
    }))
    setLocalFiles(filesWithId)
  }, [files])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: generateUniqueId(),
        file,
      }))
      const updatedFiles = [...localFiles, ...newFiles]
      setLocalFiles(updatedFiles)
      onFilesChange(updatedFiles.map(f => f.file))
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        id: generateUniqueId(),
        file,
      }))
      const updatedFiles = [...localFiles, ...newFiles]
      setLocalFiles(updatedFiles)
      onFilesChange(updatedFiles.map(f => f.file))
    }
  }

  const handleRemoveFile = async (id: number) => {
    try {
      const updatedFiles = localFiles.filter(f => f.id !== id)
      setLocalFiles(updatedFiles)
      onFilesChange(updatedFiles.map(f => f.file))
    } catch (error) {
      console.error('Error removing file:', error)
    }
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
              htmlFor="file-upload-proceso"
              className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
            >
              <span>Cargar un archivo</span>
              <Input
                id="file-upload-proceso"
                name="file-upload-proceso"
                type="file"
                className="sr-only"
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
          {localFiles.map(({ id, file }) => (
            <div key={id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
              <span className="text-sm text-gray-600">{file.name}</span>
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
  )
}
