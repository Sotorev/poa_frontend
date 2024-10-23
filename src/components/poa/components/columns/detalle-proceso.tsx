// detalle-proceso.tsx

'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface DetalleProcesoProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export function DetalleProcesoComponent({ file, onFileChange }: DetalleProcesoProps) {
  const [localFile, setLocalFile] = useState<File | null>(file)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalFile(file)
  }, [file])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const newFile = event.target.files[0]
      setLocalFile(newFile)
      onFileChange(newFile)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const newFile = event.dataTransfer.files[0]
      setLocalFile(newFile)
      onFileChange(newFile)
    }
  }

  const handleRemoveFile = () => {
    setLocalFile(null)
    onFileChange(null)
    if (fileInputRef.current) {
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
            />
            <p className="pl-1">o arrastrar y soltar</p>
          </div>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT hasta 10MB</p>
        </div>
      </div>
      {localFile && (
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
          <span className="text-sm text-gray-600">{localFile.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
