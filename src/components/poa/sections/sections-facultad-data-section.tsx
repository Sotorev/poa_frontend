// src/components/poa/sections/sections-facultad-data-section.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface SectionProps {
  name: string
  isActive: boolean
  disableEditButton?: boolean
}

export function FacultadDataSection({ name, isActive, disableEditButton = false }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [facultadData, setFacultadData] = useState({
    nombreFacultad: "",
    nombreDecano: "",
    fechaPresentacion: ""
  })

  const [tempFacultadData, setTempFacultadData] = useState(facultadData)
  const { user, loading } = useAuth()

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    if (!loading && user) {
      const fetchUserData = async () => {
        try {
          const userId = user.userId

          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (!userResponse.ok) {
            throw new Error('Error al obtener datos del usuario')
          }
          const userData = await userResponse.json()

          const faculty = userData.faculty

          if (!faculty) {
            throw new Error('El usuario no tiene una facultad asignada')
          }

          setFacultadData({
            nombreFacultad: faculty.name,
            nombreDecano: faculty.deanName,
            fechaPresentacion: faculty.fechaPresentacion || today
          })
          setTempFacultadData({
            nombreFacultad: faculty.name,
            nombreDecano: faculty.deanName,
            fechaPresentacion: faculty.fechaPresentacion || today
          })
        } catch (error) {
          console.error(error)
        }
      }

      fetchUserData()
    } else {
      setFacultadData((prevData) => ({
        ...prevData,
        fechaPresentacion: today
      }))
      setTempFacultadData((prevData) => ({
        ...prevData,
        fechaPresentacion: today
      }))
    }
  }, [user, loading])

  const handleEdit = () => {
    if (isEditing) {
      setTempFacultadData(facultadData)
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      const userId = user?.userId

      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario')
      }
      const userData = await userResponse.json()
      const faculty = userData.faculty

      if (!faculty) {
        throw new Error('El usuario no tiene una facultad asignada')
      }

      const facultyId = faculty.facultyId

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculties/${facultyId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempFacultadData.nombreFacultad,
          deanName: tempFacultadData.nombreDecano,
          fechaPresentacion: tempFacultadData.fechaPresentacion
        })
      })
      if (!response.ok) {
        throw new Error('Error al actualizar datos de la facultad')
      }
      const data = await response.json()
      setFacultadData({
        nombreFacultad: data.name,
        nombreDecano: data.deanName,
        fechaPresentacion: data.fechaPresentacion || new Date().toISOString().split('T')[0]
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
                {isEditing ? "Cancelar" : "Editar"}
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
                <Label htmlFor="nombreFacultad">Nombre de la Facultad</Label>
                <Input
                  id="nombreFacultad"
                  name="nombreFacultad"
                  value={isEditing ? tempFacultadData.nombreFacultad : facultadData.nombreFacultad}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="nombreDecano">Nombre del Decano</Label>
                <Input
                  id="nombreDecano"
                  name="nombreDecano"
                  value={isEditing ? tempFacultadData.nombreDecano : facultadData.nombreDecano}
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
                  value={isEditing ? tempFacultadData.fechaPresentacion : facultadData.fechaPresentacion}
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
