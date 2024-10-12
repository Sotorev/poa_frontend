"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from 'lucide-react'
interface SectionProps {
  name: string
  isActive: boolean
}
interface Departamento {
  id: string
  nombre: string
  director: string
}
interface Carrera {
  id: string
  nombre: string
  sede: string
  coordinador: string
}
export function EstructuraFacultadSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [departamentosData, setDepartamentosData] = useState<Departamento[]>([
    { id: "1", nombre: "Ingeniería", director: "Juan Pérez" },
    { id: "2", nombre: "Ciencias Básicas", director: "María López" },
  ])
  const [carrerasData, setCarrerasData] = useState<Carrera[]>([
    { id: "1", nombre: "Ingeniería Civil", sede: "Sede Central", coordinador: "Carlos Rodríguez" },
    { id: "2", nombre: "Ingeniería Industrial", sede: "Sede Norte", coordinador: "Ana Martínez" },
  ])
  const [newDepartamento, setNewDepartamento] = useState<Departamento>({ id: "", nombre: "", director: "" })
  const [newCarrera, setNewCarrera] = useState<Carrera>({ id: "", nombre: "", sede: "", coordinador: "" })
  const [departamentos, setDepartamentos] = useState<string[]>(["Ingeniería", "Ciencias Básicas", "Humanidades"])
  const [sedes, setSedes] = useState<string[]>(["Sede Central", "Sede Norte", "Sede Sur"])
  const [carreras, setCarreras] = useState<string[]>(["Ingeniería Civil", "Ingeniería Industrial", "Ingeniería en Sistemas"])
  const [personas, setPersonas] = useState<string[]>(["Juan Pérez", "María López", "Carlos Rodríguez"])
  const [newItem, setNewItem] = useState<string>("")
  const handleEdit = () => {
    setIsEditing(!isEditing)
  }
  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los datos en el backend
  }
  const handleDepartamentoChange = (id: string, field: keyof Departamento, value: string) => {
    setDepartamentosData(prevData =>
      prevData.map(dep => dep.id === id ? { ...dep, [field]: value } : dep)
    )
  }
  const handleCarreraChange = (id: string, field: keyof Carrera, value: string) => {
    setCarrerasData(prevData =>
      prevData.map(car => car.id === id ? { ...car, [field]: value } : car)
    )
  }
  const handleAddDepartamento = () => {
    if (newItem) {
      setDepartamentos([...departamentos, newItem])
      setNewItem("")
    }
  }
  const handleAddCarrera = () => {
    if (newItem) {
      setCarreras([...carreras, newItem])
      setNewItem("")
    }
  }
  const handleAddSede = () => {
    if (newItem) {
      setSedes([...sedes, newItem])
      setNewItem("")
    }
  }
  const handleAddPersona = () => {
    if (newItem) {
      setPersonas([...personas, newItem])
      setNewItem("")
    }
  }
  const handleAddDepartamentoRow = () => {
    const newDep: Departamento = { id: Date.now().toString(), nombre: "", director: "" }
    setDepartamentosData([...departamentosData, newDep])
  }
  const handleAddCarreraRow = () => {
    const newCar: Carrera = { id: Date.now().toString(), nombre: "", sede: "", coordinador: "" }
    setCarrerasData([...carrerasData, newCar])
  }
  const handleRemoveDepartamentoRow = (id: string) => {
    setDepartamentosData(departamentosData.filter(dep => dep.id !== id))
  }
  const handleRemoveCarreraRow = (id: string) => {
    setCarrerasData(carrerasData.filter(car => car.id !== id))
  }
  const NewItemDialog = ({ type, title, onAdd }: { type: 'departamento' | 'carrera' | 'sede' | 'persona', title: string, onAdd: () => void }) => (
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Departamentos de la Facultad</h3>
                {isEditing && (
                  <div className="mb-2 flex justify-end space-x-2">
                    <NewItemDialog type="departamento" title="departamento" onAdd={handleAddDepartamento} />
                    <NewItemDialog type="persona" title="director" onAdd={handleAddPersona} />
                    <Button variant="outline" size="sm" onClick={handleAddDepartamentoRow}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva fila
                    </Button>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Director</TableHead>
                      {isEditing && <TableHead>Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departamentosData.map((dep) => (
                      <TableRow key={dep.id}>
                        <TableCell>
                          <Select
                            disabled={!isEditing}
                            value={dep.nombre}
                            onValueChange={(value) => handleDepartamentoChange(dep.id, "nombre", value)}
                          >
                            <SelectTrigger>
                              <SelectValue>{dep.nombre || "Seleccionar departamento"}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {departamentos.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            disabled={!isEditing}
                            value={dep.director}
                            onValueChange={(value) => handleDepartamentoChange(dep.id, "director", value)}
                          >
                            <SelectTrigger>
                              <SelectValue>{dep.director || "Seleccionar director"}</SelectValue>
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
                              onClick={() => handleRemoveDepartamentoRow(dep.id)}
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
              <div>
                <h3 className="text-lg font-medium mb-2">Carreras que ofrece la Facultad por sede</h3>
                {isEditing && (
                  <div className="mb-2 flex justify-end space-x-2">
                    <NewItemDialog type="carrera" title="carrera" onAdd={handleAddCarrera} />
                    <NewItemDialog type="sede" title="sede" onAdd={handleAddSede} />
                    <NewItemDialog type="persona" title="coordinador" onAdd={handleAddPersona} />
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
                              {carreras.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
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