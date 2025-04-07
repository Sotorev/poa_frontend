'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DetalleProcesoProps {
  files: {fileId?: number, file: File, isDeleted?: boolean}[]
  onFilesChange: (files: {fileId?: number, file: File, isDeleted?: boolean}[]) => void
}

interface FileWithId {
  id: number
  fileObj: {fileId?: number, file: File, isDeleted?: boolean}
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
    
    const filesWithId = files.filter(f => !f.isDeleted).map((fileObj) => ({
      id: generateUniqueId(),
      fileObj,
    }))
    setLocalFiles(filesWithId)
  }, [files])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: generateUniqueId(),
        fileObj: { file }
      }))
      const updatedFiles = [...localFiles, ...newFiles]
      setLocalFiles(updatedFiles)
      
      // Mapear archivos para la respuesta
      const resultFiles = updatedFiles.map(f => f.fileObj)
      onFilesChange(resultFiles)
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
        fileObj: { file }
      }))
      const updatedFiles = [...localFiles, ...newFiles]
      setLocalFiles(updatedFiles)
      
      // Mapear archivos para la respuesta
      const resultFiles = updatedFiles.map(f => f.fileObj)
      onFilesChange(resultFiles)
    }
  }

  const handleRemoveFile = async (id: number) => {
    try {
      const fileToRemove = localFiles.find(f => f.id === id)
      let updatedFiles: FileWithId[] = []
      
      // Si el archivo tiene un fileId del backend, marcarlo como eliminado
      if (fileToRemove?.fileObj.fileId) {
        updatedFiles = localFiles.map(f => 
          f.id === id 
            ? { ...f, fileObj: { ...f.fileObj, isDeleted: true } } 
            : f
        )
        // Filtrar para mostrar solo los no eliminados
        setLocalFiles(updatedFiles.filter(f => !f.fileObj.isDeleted))
      } else {
        // Si no tiene fileId, simplemente quitarlo del arreglo
        updatedFiles = localFiles.filter(f => f.id !== id)
        setLocalFiles(updatedFiles)
      }
      
      // Preparar resultado: incluir todos los archivos (incluso los marcados como eliminados)
      const allFiles = updatedFiles.map(f => f.fileObj)
      onFilesChange(allFiles)
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
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
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
          {localFiles.map(({ id, fileObj }) => (
            <div key={id} className="flex items-center justify-between bg-primary/10 p-2 rounded-md">
              <span className="text-sm text-primary">{fileObj.file?.name}</span>
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
