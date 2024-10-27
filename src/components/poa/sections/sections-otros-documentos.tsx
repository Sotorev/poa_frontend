"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useCurrentUser } from '@/hooks/use-current-user'

interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
}

interface Document {
  id: string
  attachmentId: string
  poaId: number
  name: string
  filePath: string
  uploadDate: Date
  isDeleted: boolean
  file: File
  previewUrl: string
}

export function OtrosDocumentos({ name, isActive, poaId }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const user = useCurrentUser();

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaattachments/poa/${poaId}/attachments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) throw new Error('Error fetching attachments');
      
      const attachments = await response.json();
      setDocuments(attachments.map((attachment: any) => ({
        id: attachment.attachmentId.toString(),
        attachmentId: attachment.attachmentId,
        poaId: attachment.poaId,
        name: attachment.name,
        filePath: attachment.filePath,
        uploadDate: new Date(attachment.uploadDate),
        isDeleted: attachment.isDeleted,
        file: new File([], attachment.name),
        previewUrl: `/uploads/${attachment.filePath}`
      })));
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  useEffect(() => {
    fetchAttachments();

    return () => {
      documents.forEach(doc => {
        if (doc.previewUrl) {
          URL.revokeObjectURL(doc.previewUrl);
        }
      });
    };
  }, [poaId]);

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newDocuments = Array.from(files).map(file => {
        const previewUrl = URL.createObjectURL(file);
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          attachmentId: '',
          poaId: poaId,
          name: file.name,
          filePath: '',
          uploadDate: new Date(),
          isDeleted: false,
          file: file,
          previewUrl: previewUrl
        };
      });

      setDocuments(prevDocs => [...prevDocs, ...newDocuments]);

      try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('documents', file);
        });
        formData.append('poaId', poaId.toString());
        formData.append('name', files[0].name);
        formData.append('uploadDate', new Date().toISOString());
        formData.append('isDeleted', 'false');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaattachments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Error uploading document');
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setDocuments(prevDocs => 
            prevDocs.map(doc => 
              doc.name === files[0].name ? { ...doc, attachmentId: result.attachmentId } : doc
            )
          );
        } else {
          console.warn('La respuesta no es JSON:', await response.text());
        }
      } catch (error) {
        console.error('Error uploading document:', error);
        fetchAttachments();
      }
    }
  }

  const handleRemoveDocument = async (attachmentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaattachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error deleting document');
      }
      setDocuments(prevDocs => {
        const docToRemove = prevDocs.find(doc => doc.attachmentId === attachmentId);
        if (docToRemove && docToRemove.previewUrl) {
          URL.revokeObjectURL(docToRemove.previewUrl);
        }
        return prevDocs.filter(doc => doc.attachmentId !== attachmentId);
      });
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }

  const handleDownloadDocument = async (attachmentId: string, name: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaattachments/${attachmentId}/download`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) throw new Error('Error downloading document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

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
          <p className="text-sm text-gray-600 mt-2">Haga clic para descargar.</p>
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
          <h2 className="text-xl font-semibold text-primary">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-green-100" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Finalizar edición" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-green-100" onClick={() => setIsMinimized(!isMinimized)}>
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
                        onClick={() => handleDownloadDocument(doc.attachmentId, doc.name)}
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
                      className="text-primary hover:text-primary hover:bg-green-100"
                      onClick={() => handleRemoveDocument(doc.attachmentId)}
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
                <p className="text-sm text-gray-600 mb-2">El tamaño máximo de los archivos es 5MB.</p> {/* Etiqueta agregada */}
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Button className="bg-primary text-white hover:bg-green-700" onClick={triggerFileInput}>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documentos
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
