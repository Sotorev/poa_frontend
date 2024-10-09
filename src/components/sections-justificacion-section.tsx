"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'

interface SectionProps {
  name: string
  isActive: boolean
}

export function JustificacionSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [justificacion, setJustificacion] = useState<string>(
    `Esta es la justificación del Plan Operativo Anual (POA) de nuestra facultad. 
El POA es una herramienta fundamental para la planificación y ejecución de nuestras 
actividades académicas y administrativas. A través de este plan, buscamos alinear 
nuestros objetivos con la misión y visión de la universidad, asegurando una gestión 
eficiente y efectiva de nuestros recursos.

La implementación de este POA nos permitirá:
- Mejorar la calidad de nuestros programas académicos
- Fortalecer la investigación y la innovación
- Aumentar la vinculación con la sociedad
- Optimizar nuestros procesos administrativos

Con estas acciones, esperamos contribuir significativamente al desarrollo 
de nuestra institución y al cumplimiento de nuestros compromisos con la 
comunidad universitaria y la sociedad en general.`
  )

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los datos en el backend
  }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJustificacion(event.target.value)
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
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={justificacion}
                  onChange={handleChange}
                  className="min-h-[200px] w-full p-2 border rounded"
                  placeholder="Ingrese la justificación aquí..."
                />
                <Button onClick={handleSave} className="mt-4">
                  Guardar Cambios
                </Button>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{justificacion}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}