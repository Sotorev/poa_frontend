"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context' // Ajusta la ruta según corresponda

interface SectionProps {
  name: string
  isActive: boolean
}

export function FacultadDataSection({ name, isActive }: SectionProps) {
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
    const today = new Date().toISOString().split('T')[0] // Obtener la fecha actual en formato YYYY-MM-DD

    if (!loading && user) {
      const fetchUserData = async () => {
        try {
          // Obtener el userId del usuario autenticado
          const userId = user.userId

          // Obtener los datos completos del usuario, incluyendo la facultad
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
            fechaPresentacion: faculty.fechaPresentacion || today // Usar la fecha actual si no hay fecha
          })
          setTempFacultadData({
            nombreFacultad: faculty.name,
            nombreDecano: faculty.deanName,
            fechaPresentacion: faculty.fechaPresentacion || today
          })
        } catch (error) {
          console.error(error)
          // Manejo de errores
        }
      }

      fetchUserData()
    } else {
      // Si no se cargan datos y es un nuevo registro, establecer la fecha de hoy
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
      // Cancelar edición y restaurar datos originales
      setTempFacultadData(facultadData)
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      const userId = user?.userId

      // Obtener los datos del usuario para obtener la facultad
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

      // Actualizar los datos de la facultad
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculties/${facultyId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempFacultadData.nombreFacultad,
          deanName: tempFacultadData.nombreDecano,
          // Asegúrate de que el backend acepte el campo 'fechaPresentacion'
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
        fechaPresentacion: data.fechaPresentacion || today
      })
      setIsEditing(false)
    } catch (error) {
      console.error(error)
      // Manejo de errores
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
