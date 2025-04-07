'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"

interface ProcessDetailFileProps {
  files: {fileId?: number, file?: File, name?: string, isDeleted?: boolean}[]
  onFilesChange: (files: {fileId?: number, file?: File, name?: string, isDeleted?: boolean}[]) => void
}

type FileWithId = {
  id: number;
  fileData: {
    fileId?: number, 
    file?: File, 
    name?: string, 
    isDeleted?: boolean
  }
}

export function ProcessDetailFile({ files, onFilesChange }: ProcessDetailFileProps) {
  const [localFiles, setLocalFiles] = useState<FileWithId[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    console.log("files", files)
  }, [files])

  useEffect(() => {
    console.log("localFiles", localFiles)
  }, [localFiles])
  // Referencia para controlar si estamos en el primer renderizado
  const initialRender = useRef(true)

  // Genera un ID único para identificar archivos localmente
  const generateUniqueId = () => {
    return Date.now() + Math.random() * 1000;
  };

  // Sincroniza los archivos locales con los props
  useEffect(() => {
    // Solo actualizar si es el primer renderizado o si los archivos han cambiado externamente
    if (initialRender.current) {
      if (!files || files.length === 0) return;
      
      const filesWithId = files.map((fileData) => ({
        id: generateUniqueId(),
        fileData: { ...fileData }
      }));
      
      setLocalFiles(filesWithId);
      initialRender.current = false;
    }
  }, [files]);

  // Maneja la carga de nuevos archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: generateUniqueId(),
        fileData: { 
          file: file,
          name: file.name
        }
      }));
      
      // Conservar los archivos existentes y agregar los nuevos
      const updatedFiles = [...localFiles, ...newFiles];
      setLocalFiles(updatedFiles);
      
      // Actualiza el estado de archivos para el componente padre
      // Importante: Mantener los archivos de API existentes (incluyendo los marcados como eliminados)
      const apiFiles = files.filter(f => 'fileId' in f && f.fileId !== undefined);
      const localFileData = updatedFiles
        .filter(f => !('fileId' in f.fileData) || f.fileData.fileId === undefined)
        .map(f => f.fileData);
      
      // Combinar archivos de API con archivos locales
      onFilesChange([...apiFiles, ...localFileData]);
      
      // Limpia el input para permitir seleccionar el mismo archivo después
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Maneja el arrastrar y soltar de archivos
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        id: generateUniqueId(),
        fileData: { 
          file: file,
          name: file.name
        }
      }));
      
      // Conservar los archivos existentes y agregar los nuevos
      const updatedFiles = [...localFiles, ...newFiles];
      setLocalFiles(updatedFiles);
      
      // Actualiza el estado de archivos para el componente padre
      // Importante: Mantener los archivos de API existentes (incluyendo los marcados como eliminados)
      const apiFiles = files.filter(f => 'fileId' in f && f.fileId !== undefined);
      const localFileData = updatedFiles
        .filter(f => !('fileId' in f.fileData) || f.fileData.fileId === undefined)
        .map(f => f.fileData);
      
      // Combinar archivos de API con archivos locales
      onFilesChange([...apiFiles, ...localFileData]);
    }
  }

  // Maneja la eliminación de archivos
  const handleRemoveFile = (fileId: number) => {
    const fileIndex = localFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) return;

    const fileToRemove = localFiles[fileIndex];
    let updatedLocalFiles: FileWithId[] = [];

    if (fileToRemove.fileData.fileId) {
      // Si es un archivo cargado desde la API, marcarlo como eliminado en localFiles
      updatedLocalFiles = localFiles.map(f => 
        f.id === fileId 
          ? { ...f, fileData: { ...f.fileData, isDeleted: true } } 
          : f
      );
      setLocalFiles(updatedLocalFiles);
      
      // Para el estado de archivos del componente padre, localizar y actualizar solo el archivo específico de la API
      const updatedApiFiles = files.map(f => 
        'fileId' in f && f.fileId === fileToRemove.fileData.fileId 
          ? { ...f, isDeleted: true } 
          : f
      );
      
      // Obtener los archivos subidos por el usuario
      const userFiles = localFiles
        .filter(f => !f.fileData.fileId && f.id !== fileId)
        .map(f => f.fileData);
      
      // Combinar todo y notificar
      onFilesChange([...updatedApiFiles, ...userFiles]);
    } else {
      // Si es un archivo agregado por el usuario, eliminarlo del array local
      updatedLocalFiles = localFiles.filter(f => f.id !== fileId);
      setLocalFiles(updatedLocalFiles);
      
      // Para el estado de archivos del componente padre, mantener los archivos de API intactos
      // y actualizar solo los archivos del usuario
      const apiFiles = files.filter(f => 'fileId' in f && f.fileId !== undefined);
      const userFiles = updatedLocalFiles
        .filter(f => !f.fileData.fileId)
        .map(f => f.fileData);
      
      // Combinar y notificar
      onFilesChange([...apiFiles, ...userFiles]);
    }
  };

  // Obtiene el nombre para mostrar del archivo
  const getDisplayName = (fileData: {fileId?: number, file?: File, name?: string}) => {
    return fileData.name || (fileData.file?.name || "Archivo sin nombre");
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
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:underline focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
            >
              <span>Cargar un archivo</span>
              <Input
                id="file-upload"
                name="file-upload"
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
      
      {localFiles.filter(f => !f.fileData.isDeleted).length > 0 && (
        <div className="space-y-2">
          {localFiles
            .filter(f => !f.fileData.isDeleted)
            .map(({ id, fileData }) => (
              <div key={id} className="flex items-center justify-between bg-primary/10 p-2 rounded-md">
                <span className="text-sm text-primary">{getDisplayName(fileData)}</span>
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
