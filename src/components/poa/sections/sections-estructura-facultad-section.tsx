"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  id: string
  nombre: string
  sede: string
  coordinador: string
}

// Componente principal
export function EstructuraFacultadSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para carreras
  const [carrerasData, setCarrerasData] = useState<Carrera[]>([])
  const [newItem, setNewItem] = useState<string>("")
  const [sedes, setSedes] = useState<string[]>(["Sede Central", "Sede Norte", "Sede Sur"])
  const [personas, setPersonas] = useState<string[]>(["Carlos Rodríguez", "Ana Martínez"])
  const { user, loading } = useAuth()

  // Obtener las carreras del backend según la facultad del usuario
  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        if (!loading && user) {
          const userId = user.userId

          // Obtener datos del usuario
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

          // Obtener las carreras de la facultad
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/programs?facultyId=${facultyId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (!response.ok) {
            throw new Error('Error al cargar las carreras')
          }
          const data = await response.json()
          setCarrerasData(data)
        }
      } catch (error) {
        console.error("Error al cargar las carreras", error)
      }
    }

    fetchCarreras()
  }, [user, loading])

  // Funciones de manejo de carreras
  const handleCarreraChange = (id: string, field: keyof Carrera, value: string) => {
    setCarrerasData(prevData =>
      prevData.map(car => car.id === id ? { ...car, [field]: value } : car)
    )
  }

  const handleAddCarreraRow = () => {
    const newCar: Carrera = { id: Date.now().toString(), nombre: "", sede: "", coordinador: "" }
    setCarrerasData([...carrerasData, newCar])
  }

  const handleRemoveCarreraRow = (id: string) => {
    setCarrerasData(carrerasData.filter(car => car.id !== id))
  }

  const NewItemDialog = ({ type, title, onAdd }: { type: 'carrera' | 'sede' | 'persona', title: string, onAdd: () => void }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo {title}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo {title}</DialogTitle>
        </DialogHeader>
        <Input
          placeholder={`Nombre del nuevo ${title}`}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Button onClick={onAdd}>Agregar</Button>
      </DialogContent>
    </Dialog>
  )

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
              <div>
                <h3 className="text-lg font-medium mb-2">Carreras que ofrece la Facultad por sede</h3>
                {isEditing && (
                  <div className="mb-2 flex justify-end space-x-2">
                    <NewItemDialog type="carrera" title="carrera" onAdd={handleAddCarreraRow} />
                    <NewItemDialog type="sede" title="sede" onAdd={() => {}} />
                    <NewItemDialog type="persona" title="coordinador" onAdd={() => {}} />
                    <Button variant="outline" size="sm" onClick={handleAddCarreraRow}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva fila
                    </Button>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrera</TableHead>
                      <TableHead>Sede</TableHead>
                      <TableHead>Coordinador</TableHead>
                      {isEditing && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrerasData.map((car) => (
                      <TableRow key={car.id}>
                        <TableCell>
                          <Select
                            disabled={!isEditing}
                            value={car.nombre}
                            onValueChange={(value) => handleCarreraChange(car.id, "nombre", value)}
                          >
                            <SelectTrigger>
                              <SelectValue>{car.nombre || "Seleccionar carrera"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {carrerasData.map((c) => (
                                <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            disabled={!isEditing}
                            value={car.sede}
                            onValueChange={(value) => handleCarreraChange(car.id, "sede", value)}
                          >
                            <SelectTrigger>
                              <SelectValue>{car.sede || "Seleccionar sede"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {sedes.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            disabled={!isEditing}
                            value={car.coordinador}
                            onValueChange={(value) => handleCarreraChange(car.id, "coordinador", value)}
                          >
                            <SelectTrigger>
                              <SelectValue>{car.coordinador || "Seleccionar coordinador"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {personas.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {isEditing && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveCarreraRow(car.id)}
                              aria-label="Eliminar fila"
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
                <Button onClick={() => {}} className="mt-4">
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
