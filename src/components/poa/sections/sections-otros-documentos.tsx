"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'

interface SectionProps {
  name: string
  isActive: boolean
}

interface Document {
  id: string
  name: string
  file: File
  previewUrl: string
}

export function OtrosDocumentos({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      documents.forEach(doc => {
        if (doc.previewUrl) {
          URL.revokeObjectURL(doc.previewUrl)
        }
      })
    }
  }, [documents])

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    console.log('Documentos guardados:', documents)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newDocuments = Array.from(files).map(file => {
        const previewUrl = URL.createObjectURL(file)
        console.log(`Created preview URL for ${file.name}:`, previewUrl)
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          file: file,
          previewUrl: previewUrl
        }
      })
      setDocuments(prevDocs => [...prevDocs, ...newDocuments])
    }
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prevDocs => {
      const docToRemove = prevDocs.find(doc => doc.id === id)
      if (docToRemove && docToRemove.previewUrl) {
        URL.revokeObjectURL(docToRemove.previewUrl)
      }
      return prevDocs.filter(doc => doc.id !== id)
    })
  }

  const handleViewDocument = (document: Document) => {
    window.open(document.previewUrl, '_blank')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleMouseEnter = (id: string) => {
    timerRef.current = setTimeout(() => {
      setOpenPopoverId(id)
    }, 1000)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setOpenPopoverId(null)
  }

  const renderPreview = (document: Document) => {
    const fileType = document.file.type

    if (fileType.startsWith('image/')) {
      return (
        <div className="max-w-xs max-h-48 overflow-hidden">
          <Image src={document.previewUrl} alt={document.name} className="w-full h-auto" />
        </div>
      )
    } else if (fileType === 'application/pdf') {
      return (
        <iframe
          src={document.previewUrl}
          title={document.name}
          width="100%"
          height="200px"
          className="border-none"
        />
      )
    } else if (fileType === 'text/plain') {
      return (
        <iframe
          src={document.previewUrl}
          title={document.name}
          width="100%"
          height="200px"
          className="border-none"
        />
      )
    } else {
      return (
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">Vista previa no disponible para este tipo de archivo.</p>
          <p className="text-sm text-gray-600 mt-2">Haga clic para abrir en una nueva ventana.</p>
        </div>
      )
    }
  }

  return (
    <div id={name} className="mb-6">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <ul className="space-y-2">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between">
                  <Popover open={openPopoverId === doc.id}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="link"
                        onClick={() => handleViewDocument(doc)}
                        onMouseEnter={() => handleMouseEnter(doc.id)}
                        onMouseLeave={handleMouseLeave}
                        className="text-left"
                      >
                        {doc.name}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      {renderPreview(doc)}
                    </PopoverContent>
                  </Popover>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(doc.id)}
                      aria-label={`Eliminar ${doc.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {isEditing && (
              <div className="mt-4">
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Button onClick={triggerFileInput}>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documentos
                </Button>
              </div>
            )}
            {isEditing && (
              <Button onClick={handleSave} className="mt-4">
                Guardar Cambios
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}