"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'

interface SectionProps {
  name: string
  isActive: boolean
}

export function FacultadDataSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [facultadData, setFacultadData] = useState({
    nombreFacultad: "Facultad de Ingeniería",
    nombreDecano: "Dr. Juan Pérez",
    fechaPresentacion: "2023-07-15"
  })

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los datos en el backend
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFacultadData(prevData => ({
      ...prevData,
      [name]: value
    }))
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombreFacultad">Nombre de la Facultad</Label>
                <Input
                  id="nombreFacultad"
                  name="nombreFacultad"
                  value={facultadData.nombreFacultad}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="nombreDecano">Nombre del Decano</Label>
                <Input
                  id="nombreDecano"
                  name="nombreDecano"
                  value={facultadData.nombreDecano}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="fechaPresentacion">Fecha de Presentación del POA</Label>
                <Input
                  id="fechaPresentacion"
                  name="fechaPresentacion"
                  type="date"
                  value={facultadData.fechaPresentacion}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="mt-4">
                  Guardar Cambios
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}