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
  const [studentCountExists, setStudentCountExists] = useState(false)
  const [studentCountId, setStudentCountId] = useState<number | null>(null)
  const currentYear = new Date().getFullYear() 
  const user = useCurrentUser()

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

      let studentCountData = null
      let studentCountExists = false
      let studentCountId = null

      try {
        const studentCountResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facultystudenthistories/count/${facultyId}/${currentYear}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        })

        if (!studentCountResponse.ok) {
          throw new Error('Error fetching student count')
        }

        studentCountData = await studentCountResponse.json()
        studentCountExists = !!studentCountData.studentCount
        studentCountId = studentCountData.id

      } catch (error) {
        console.error('Error fetching student count:', error)
        studentCountExists = false
      }

      setFacultadData({
        nombreFacultad: facultyData.name,
        nombreDecano: facultyData.deanName,
        fechaPresentacion: poaData.submissionDate, 
        cantidadEstudiantes: studentCountData?.studentCount || ""
      })

      setTempFacultadData({
        nombreFacultad: facultyData.name,
        nombreDecano: facultyData.deanName,
        fechaPresentacion: poaData.submissionDate, 
        cantidadEstudiantes: studentCountData?.studentCount || ""
      })

      setStudentCountExists(studentCountExists)
      setStudentCountId(studentCountId)

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [facultyId, poaId, user, currentYear])

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
        })
      })

      if (!response.ok) {
        throw new Error('Error updating faculty data')
      }

      const studentCount = parseInt(tempFacultadData.cantidadEstudiantes)

      if (studentCountExists) {
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facultystudenthistories/${studentCountId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            studentCount: studentCount,
            facultyId: facultyId,
            year: currentYear,
          })
        })

        if (!updateResponse.ok) {
          throw new Error('Error updating student count')
        }

      } else {
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facultystudenthistories/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            studentCount: studentCount,
            facultyId: facultyId,
            year: currentYear,
          })
        })

        if (!createResponse.ok) {
          throw new Error('Error creating student count')
        }
      }

      setFacultadData(tempFacultadData)
      setIsEditing(false)

      await fetchData()

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
        <CardTitle className="text-xl font-semibold text-primary">{name}</CardTitle>
        <div className="flex items-center space-x-2">
          {isEditable && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-primary hover:text-primary hover:bg-green-100">
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-primary hover:text-primary hover:bg-green-100">
            {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="p-4 bg-white">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nombreFacultad" className="text-sm font-medium text-black">Nombre de la Facultad</Label>
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
              <Label htmlFor="nombreDecano" className="text-sm font-medium text-black">Nombre del Decano</Label>
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
              <Label htmlFor="fechaPresentacion" className="text-sm font-medium text-black">Fecha de Presentación del POA</Label>
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
              <Label htmlFor="cantidadEstudiantes" className="text-sm font-medium text-black">Cantidad de Estudiantes</Label>
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
            <Button onClick={handleSave} className="mt-6 bg-primary hover:bg-green-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}
