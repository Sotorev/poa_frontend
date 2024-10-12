"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

// Interfaces
interface SectionProps {
  name: string
  isActive: boolean
}

interface Carrera {
  programId: number
  name: string
  director: string
  facultyId?: number
}

interface Sede {
  sedeId: number
  nombre: string
  ciudad: string
  departamento: string
}

// Componente principal
export function EstructuraFacultadSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para carreras y sedes
  const [carrerasData, setCarrerasData] = useState<Carrera[]>([])
  const [sedesData, setSedesData] = useState<Sede[]>([])
  const { user, loading } = useAuth()

  // Estados para los diálogos
  const [isAddSedeDialogOpen, setIsAddSedeDialogOpen] = useState(false)
  const [isAddCarreraDialogOpen, setIsAddCarreraDialogOpen] = useState(false)

  // Estados para los nuevos datos
  const [newSedeData, setNewSedeData] = useState<Sede>({ sedeId: 0, nombre: '', ciudad: '', departamento: '' })
  const [newCarreraData, setNewCarreraData] = useState<Carrera>({ programId: 0, name: '', director: '' })

  // Almacenar facultyId
  const [facultyId, setFacultyId] = useState<number | null>(null)

  // Obtener las carreras y sedes del backend según la facultad del usuario
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!loading && user) {
          const userId = user.userId
          console.log("User ID:", userId)

          // Obtener datos del usuario
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          console.log("Fetching user data:", userResponse)
          if (!userResponse.ok) {
            throw new Error('Error al obtener datos del usuario')
          }
          const userData = await userResponse.json()
          console.log("User data received:", userData)
          const faculty = userData.faculty

          if (!faculty) {
            throw new Error('El usuario no tiene una facultad asignada')
          }

          const facultyId = faculty.facultyId
          console.log("Faculty ID:", facultyId)
          setFacultyId(facultyId)

          // Obtener las carreras de la facultad
          const responsePrograms = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/programs/faculty/${facultyId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },  
          })
          console.log("Fetching programs:", responsePrograms)
          if (!responsePrograms.ok) {
            throw new Error('Error al cargar las carreras')
          }
          const dataPrograms = await responsePrograms.json()
          console.log("Programs data received:", dataPrograms)
          setCarrerasData(dataPrograms)

          // Obtener las sedes de la facultad
          // Aquí deberías ajustar la ruta y lógica para obtener las sedes si corresponde
        }
      } catch (error) {
        console.error("Error al cargar los datos", error)
      }
    }

    fetchData()
  }, [user, loading])

  // Funciones de manejo de carreras
  const handleCarreraChange = (programId: number, field: keyof Carrera, value: string) => {
    setCarrerasData(prevData =>
      prevData.map(car => car.programId === programId ? { ...car, [field]: value } : car)
    )
  }

  const handleAddCarrera = async () => {
    try {
      if (!facultyId) {
        throw new Error('No se encontró el facultyId')
      }
      const newCarrera: Carrera = { name: newCarreraData.name, director: newCarreraData.director, facultyId }
      // Realizar la solicitud POST al backend para crear la nueva carrera
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/programs`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCarrera),
      })
      if (!response.ok) {
        throw new Error('Error al crear la carrera')
      }
      const createdProgram = await response.json()
      setCarrerasData([...carrerasData, createdProgram])
      setIsAddCarreraDialogOpen(false)
      setNewCarreraData({ programId: 0, name: '', director: '' })
    } catch (error) {
      console.error("Error al agregar carrera", error)
    }
  }

  const handleRemoveCarreraRow = async (programId: number) => {
    try {
      // Realizar la solicitud DELETE al backend para eliminar la carrera
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/programs/${programId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Error al eliminar la carrera')
      }
      // Actualizar el estado local
      setCarrerasData(carrerasData.filter(car => car.programId !== programId))
    } catch (error) {
      console.error("Error al eliminar carrera", error)
    }
  }

  // Función para actualizar carreras
  const handleUpdateCarrera = async (program: Carrera) => {
    try {
      // Realizar la solicitud PUT al backend para actualizar la carrera
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/programs/${program.programId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(program),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar la carrera')
      }
      const updatedProgram = await response.json()
      // Actualizar el estado local
      setCarrerasData(prevData =>
        prevData.map(car => car.programId === updatedProgram.programId ? updatedProgram : car)
      )
    } catch (error) {
      console.error("Error al actualizar carrera", error)
    }
  }

  // Funciones de manejo de sedes (similar al manejo de carreras, debes ajustarlas según tus rutas)

  const handleSave = async () => {
    try {
      // Guardar los cambios realizados en las carreras
      for (const carrera of carrerasData) {
        if (carrera.programId < 0) {
          // Si programId es negativo, es una nueva carrera que necesita ser creada
          await handleAddCarrera()
        } else {
          // Carrera existente, actualizar
          await handleUpdateCarrera(carrera)
        }
      }
      // Aquí puedes manejar la lógica para las sedes si lo deseas
    } catch (error) {
      console.error("Error al guardar los cambios", error)
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <div id={name} className="mb-6">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-green-400' : ''}`}
      >
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
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
            <div className="space-y-6">
              {/* Tabla de Sedes (opcional, ajusta según tus necesidades) */}

              {/* Tabla de Carreras */}
              <div>
                <h3 className="text-lg font-medium mb-2">Carreras que ofrece la Facultad</h3>
                {isEditing && (
                  <div className="mb-2 flex justify-end space-x-2">
                    <Dialog open={isAddCarreraDialogOpen} onOpenChange={setIsAddCarreraDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Carrera
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nueva Carrera</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Nombre de la carrera"
                            value={newCarreraData.name}
                            onChange={(e) => setNewCarreraData({ ...newCarreraData, name: e.target.value })}
                          />
                          <Input
                            placeholder="Director"
                            value={newCarreraData.director}
                            onChange={(e) => setNewCarreraData({ ...newCarreraData, director: e.target.value })}
                          />
                          <Button onClick={handleAddCarrera}>Agregar</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrera</TableHead>
                      <TableHead>Director</TableHead>
                      {isEditing && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrerasData.map((car) => (
                      <TableRow key={car.programId}>
                        <TableCell>
                          <Input
                            disabled={!isEditing}
                            value={car.name}
                            onChange={(e) => handleCarreraChange(car.programId, "name", e.target.value)}
                            onBlur={() => isEditing && handleUpdateCarrera(car)}
                            placeholder="Nombre de la carrera"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            disabled={!isEditing}
                            value={car.director}
                            onChange={(e) => handleCarreraChange(car.programId, "director", e.target.value)}
                            onBlur={() => isEditing && handleUpdateCarrera(car)}
                            placeholder="Nombre del director"
                          />
                        </TableCell>
                        {isEditing && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCarreraRow(car.programId)}
                              aria-label="Eliminar carrera"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
