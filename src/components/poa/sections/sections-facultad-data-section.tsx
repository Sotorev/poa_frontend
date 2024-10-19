// src/components/poa/sections/sections-facultad-data-section.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'

interface SectionProps {
  name: string
  isActive: boolean
  disableEditButton?: boolean
  poaId: number
  facultyId: number
}

interface FacultadData {
  name: string
  deanName: string
  submissionDate: string
}

export function FacultadDataSection({ name, isActive, facultyId, poaId, disableEditButton = false }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [facultadData, setFacultadData] = useState<FacultadData>({
    name: "",
    deanName: "",
    submissionDate: ""
  })

  const [tempFacultadData, setTempFacultadData] = useState<FacultadData>({
    name: "",
    deanName: "",
    submissionDate: ""
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchFacultadData = async () => {
      try {
        const facultyResponse = await fetch(`${API_URL}/api/faculties/${facultyId}`, {
          credentials: 'include',
          headers: {
          'Content-Type': 'application/json',
        },
        })

        if (!facultyResponse.ok) {
          throw new Error('Error al obtener datos de la facultad')
        }

        const facultyData: {
          name: string
          deanName: string
        } = await facultyResponse.json()

        const poaResponse = await fetch(`${API_URL}/api/poas/${poaId}`, {
          credentials: 'include',
          headers: {
          'Content-Type': 'application/json',
        },
        })

        if (!poaResponse.ok) {
          throw new Error('Error al obtener la fecha de presentación del POA')
        }

        const poaData: {
          submissionDate: string
        } = await poaResponse.json()

        setFacultadData({
          name: facultyData.name,
          deanName: facultyData.deanName,
          submissionDate: poaData.submissionDate
        })

        setTempFacultadData({
          name: facultyData.name,
          deanName: facultyData.deanName,
          submissionDate: poaData.submissionDate
        })
      } catch (error) {
        console.error(error)
      }
    }

    if (facultyId && poaId) {
      fetchFacultadData()
    }
  }, [API_URL, facultyId, poaId])

  const handleEdit = () => {
    if (isEditing) {
      setTempFacultadData(facultadData)
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faculties/${facultyId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempFacultadData.name,
          deanName: tempFacultadData.deanName
          // No enviamos submissionDate ya que no es editable
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar datos de la facultad')
      }

      const data = await response.json()
      setFacultadData({
        name: data.name,
        deanName: data.deanName,
        submissionDate: facultadData.submissionDate // Mantener la fecha existente
      })
      setIsEditing(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTempFacultadData(prevData => ({
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
            {!disableEditButton && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Finalizar edición" : "Editar"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Facultad</Label>
                <Input
                  id="name"
                  name="name"
                  value={isEditing ? tempFacultadData.name : facultadData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="deanName">Nombre del Decano</Label>
                <Input
                  id="deanName"
                  name="deanName"
                  value={isEditing ? tempFacultadData.deanName : facultadData.deanName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="submissionDate">Fecha de Presentación del POA</Label>
                <Input
                  id="submissionDate"
                  name="submissionDate"
                  type="date"
                  value={facultadData.submissionDate}
                  disabled // Hacer que el campo sea de solo lectura
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
