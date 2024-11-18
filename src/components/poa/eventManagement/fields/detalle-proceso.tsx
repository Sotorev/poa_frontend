// detalle-proceso.tsx

'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface DetalleProcesoProps {
  file: File[]  // Change to an array of Files
  onFileChange: (files: File[]) => void  // Update to handle multiple files
}

export function DetalleProcesoComponent({ file, onFileChange }: DetalleProcesoProps) {
  const [localFiles, setLocalFiles] = useState<File[]>(file || [])  // Initialize with an array

  useEffect(() => {
    setLocalFiles(file || [])
  }, [file])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      setLocalFiles(newFiles)
      onFileChange(newFiles)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files)
      setLocalFiles(newFiles)
      onFileChange(newFiles)
    }
  }

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...localFiles]
    updatedFiles.splice(index, 1)
    setLocalFiles(updatedFiles)
    onFileChange(updatedFiles)
    if (updatedFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = ""
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
          <div className="flex text-sm text-gray-600 items-center">
            <label
              htmlFor="file-upload-proceso"
              className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
            >
              <span>Cargar un archivo</span>
            </label>
            <input
              id="file-upload-proceso"
              name="file-upload-proceso"
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              multiple  // Allow multiple file selection
            />
            <p className="pl-1">o arrastrar y soltar</p>
          </div>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT hasta 10MB</p>
        </div>
      </div>
      {localFiles.length > 0 && localFiles.map((file, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
          <span className="text-sm text-gray-600">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveFile(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
