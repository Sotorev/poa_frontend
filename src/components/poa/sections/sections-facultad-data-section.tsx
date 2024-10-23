'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Edit, Save } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'

interface FacultadDataSectionProps {
  name: string
  isActive: boolean
  isEditable: boolean
  poaId: number
  facultyId: number
}

export function FacultadDataSection({ name, isActive, isEditable, poaId, facultyId }: FacultadDataSectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [facultadData, setFacultadData] = useState({
    nombreFacultad: "",
    nombreDecano: "",
    fechaPresentacion: "",
    cantidadEstudiantes: ""
  })
  const [tempFacultadData, setTempFacultadData] = useState(facultadData)
  const user = useCurrentUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultyResponse, poaResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculties/${facultyId}`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/${poaId}`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          })
        ])

        if (!facultyResponse.ok || !poaResponse.ok) {
          throw new Error('Error fetching data')
        }

        const facultyData = await facultyResponse.json()
        const poaData = await poaResponse.json()

        setFacultadData({
          nombreFacultad: facultyData.name,
          nombreDecano: facultyData.deanName,
          fechaPresentacion: poaData.submissionDate || new Date().toISOString().split('T')[0],
          cantidadEstudiantes: facultyData.studentCount || ""
        })
        setTempFacultadData({
          nombreFacultad: facultyData.name,
          nombreDecano: facultyData.deanName,
          fechaPresentacion: poaData.submissionDate || new Date().toISOString().split('T')[0],
          cantidadEstudiantes: facultyData.studentCount || ""
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [facultyId, poaId, user])

  const handleEdit = () => {
    if (isEditing) {
      setTempFacultadData(facultadData)
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculties/${facultyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          name: tempFacultadData.nombreFacultad,
          deanName: tempFacultadData.nombreDecano,
          studentCount: parseInt(tempFacultadData.cantidadEstudiantes)
        })
      })

      if (!response.ok) {
        throw new Error('Error updating faculty data')
      }

      setFacultadData(tempFacultadData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving data:', error)
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
    <Card className={`mb-6 ${isActive ? 'ring-2 ring-green-600' : ''}`}>
      <CardHeader className="bg-green-50 flex flex-row items-center justify-between py-2">
        <CardTitle className="text-xl font-semibold text-green-800">{name}</CardTitle>
        <div className="flex items-center space-x-2">
          {isEditable && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-green-700 hover:text-green-900">
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-green-700 hover:text-green-900">
            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-4 bg-white">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nombreFacultad" className="text-sm font-medium text-gray-700">Nombre de la Facultad</Label>
              <Input
                id="nombreFacultad"
                name="nombreFacultad"
                value={isEditing ? tempFacultadData.nombreFacultad : facultadData.nombreFacultad}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="nombreDecano" className="text-sm font-medium text-gray-700">Nombre del Decano</Label>
              <Input
                id="nombreDecano"
                name="nombreDecano"
                value={isEditing ? tempFacultadData.nombreDecano : facultadData.nombreDecano}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fechaPresentacion" className="text-sm font-medium text-gray-700">Fecha de Presentación del POA</Label>
              <Input
                id="fechaPresentacion"
                name="fechaPresentacion"
                type="date"
                value={facultadData.fechaPresentacion}
                disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cantidadEstudiantes" className="text-sm font-medium text-gray-700">Cantidad de Estudiantes</Label>
              <Input
                id="cantidadEstudiantes"
                name="cantidadEstudiantes"
                type="number"
                value={isEditing ? tempFacultadData.cantidadEstudiantes : facultadData.cantidadEstudiantes}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
          {isEditing && (
            <Button onClick={handleSave} className="mt-6 bg-green-600 hover:bg-green-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}