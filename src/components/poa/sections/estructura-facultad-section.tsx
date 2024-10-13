"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, PlusCircle, Pencil, Save } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Toast } from '@radix-ui/react-toast'

interface SectionProps {
  name: string
  isActive: boolean
}

interface Departamento {
  id: string
  nombre: string
  director: string
}

interface Career {
  id: number
  name: string
  coordinator: string
}

interface Sede {
  id: string
  name: string
  city: string
  department: string
  studentCount: number
}

interface SedeData {
  id: string
  name: string
  careers: Career[]
}

const availableCareers: Career[] = [
  { id: 1, name: "Ingeniería Informática", coordinator: "Dr. Juan Pérez" },
  { id: 2, name: "Medicina", coordinator: "Dra. María González" },
  { id: 3, name: "Derecho", coordinator: "Dr. Carlos Rodríguez" },
  { id: 4, name: "Arquitectura", coordinator: "Arq. Ana Martínez" },
  { id: 5, name: "Psicología", coordinator: "Dra. Laura Sánchez" },
]

const availableDepartamentos: Departamento[] = [
  { id: "1", nombre: "Ingeniería", director: "Dr. Juan Pérez" },
  { id: "2", nombre: "Ciencias Básicas", director: "Dra. María González" },
  { id: "3", nombre: "Humanidades", director: "Dr. Carlos Rodríguez" },
]

export function EstructuraFacultadSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [departamentosData, setDepartamentosData] = useState<Departamento[]>([
    { id: "1", nombre: "Ingeniería", director: "Juan Pérez" },
    { id: "2", nombre: "Ciencias Básicas", director: "María López" },
  ])
  const [sedes, setSedes] = useState<Sede[]>([
    { id: "north", name: "Sede Norte", city: "Ciudad A", department: "Departamento X", studentCount: 5000 },
    { id: "south", name: "Sede Sur", city: "Ciudad B", department: "Departamento Y", studentCount: 4500 },
    { id: "east", name: "Sede Este", city: "Ciudad C", department: "Departamento Z", studentCount: 3800 },
    { id: "west", name: "Sede Oeste", city: "Ciudad D", department: "Departamento W", studentCount: 4200 },
  ])
  const [selectedSedes, setSelectedSedes] = useState<SedeData[]>([])
  const [newDepartamento, setNewDepartamento] = useState<Departamento>({ id: "", nombre: "", director: "" })
  const [newCareer, setNewCareer] = useState<Career>({ id: 0, name: "", coordinator: "" })
  const [departamentos, setDepartamentos] = useState<string[]>(["Ingeniería", "Ciencias Básicas", "Humanidades"])
  const [personas, setPersonas] = useState<string[]>(["Juan Pérez", "María López", "Carlos Rodríguez"])
  const [newItem, setNewItem] = useState<string>("")
  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false)
  const [isDepartamentoDialogOpen, setIsDepartamentoDialogOpen] = useState(false)
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null)
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null)
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null)
  const [careerMode, setCareerMode] = useState<"select" | "create">("select")
  const [departamentoMode, setDepartamentoMode] = useState<"select" | "create">("select")
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSedeDialogOpen, setIsSedeDialogOpen] = useState(false)
  const [newSede, setNewSede] = useState<Sede>({
    id: "",
    name: "",
    city: "",
    department: "",
    studentCount: 0
  })

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    Toast({
      title: "Cambios guardados",
    })
  }

  const handleDepartamentoChange = (id: string, field: keyof Departamento, value: string) => {
    setDepartamentosData(prevData =>
      prevData.map(dep => dep.id === id ? { ...dep, [field]: value } : dep)
    )
  }

  const handleAddDepartamento = () => {
    setIsDepartamentoDialogOpen(true)
    setDepartamentoMode("select")
    setSelectedDepartamento(null)
    setNewDepartamento({ id: "", nombre: "", director: "" })
    setIsEditMode(false)
  }

  const handleAddPersona = () => {
    if (newItem) {
      setPersonas([...personas, newItem])
      setNewItem("")
    }
  }

  const handleRemoveDepartamentoRow = (id: string) => {
    setDepartamentosData(departamentosData.filter(dep => dep.id !== id))
  }

  const handleAddCareer = (sedeId: string) => {
    setSelectedSedeId(sedeId)
    setIsCareerDialogOpen(true)
    setCareerMode("select")
    setSelectedCareer(null)
    setNewCareer({ id: 0, name: "", coordinator: "" })
    setIsEditMode(false)
  }

  const handleCareerSelect = (careerId: string) => {
    const career = availableCareers.find(c => c.id.toString() === careerId)
    setSelectedCareer(career || null)
  }

  const handleDepartamentoSelect = (departamentoId: string) => {
    const departamento = availableDepartamentos.find(d => d.id === departamentoId)
    setSelectedDepartamento(departamento || null)
  }

  const handleNewCareerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCareer(prev => ({ ...prev, [name]: value }))
  }

  const handleNewDepartamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDepartamento(prev => ({ ...prev, [name]: value }))
  }

  const handleConfirmAddCareer = () => {
    if (selectedSedeId) {
      let careerToAdd: Career
      if (careerMode === "select" && selectedCareer) {
        careerToAdd = selectedCareer
      } else if (careerMode === "create" && newCareer.name && newCareer.coordinator) {
        careerToAdd = { ...newCareer, id: Date.now() }
      } else {
        return
      }

      setSelectedSedes(prevSedes =>
        prevSedes.map(sede =>
          sede.id === selectedSedeId
            ? { ...sede, careers: [...sede.careers, careerToAdd] }
            : sede
        )
      )
      setIsCareerDialogOpen(false)
      setSelectedCareer(null)
      setNewCareer({ id: 0, name: "", coordinator: "" })
    }
  }

  const handleConfirmAddDepartamento = () => {
    let departamentoToAdd: Departamento
    if (departamentoMode === "select" && selectedDepartamento) {
      departamentoToAdd = selectedDepartamento
    } else if (departamentoMode === "create" && newDepartamento.nombre && newDepartamento.director) {
      departamentoToAdd = { ...newDepartamento, id: Date.now().toString() }
    } else {
      return
    }

    setDepartamentosData(prevDepartamentos => [...prevDepartamentos, departamentoToAdd])
    setIsDepartamentoDialogOpen(false)
    setSelectedDepartamento(null)
    setNewDepartamento({ id: "", nombre: "", director: "" })
    setIsEditMode(false)
  }

  const handleEditCareer = (sedeId: string, career: Career) => {
    setSelectedSedeId(sedeId)
    setNewCareer(career)
    setIsCareerDialogOpen(true)
    setCareerMode("create")
    setIsEditMode(true)
  }

  const handleEditDepartamento = (departamento: Departamento) => {
    setNewDepartamento(departamento)
    setIsDepartamentoDialogOpen(true)
    setDepartamentoMode("create")
    setIsEditMode(true)
  }

  const handleConfirmEditCareer = () => {
    if (selectedSedeId && newCareer.id) {
      setSelectedSedes(prevSedes =>
        prevSedes.map(sede =>
          sede.id === selectedSedeId
            ? {
                ...sede,
                careers: sede.careers.map(c =>
                  c.id === newCareer.id ? newCareer : c
                )
              }
            : sede
        )
      )
      setIsCareerDialogOpen(false)
      setNewCareer({ id: 0, name: "", coordinator: "" })
      setIsEditMode(false)
    }
  }

  const handleConfirmEditDepartamento = () => {
    if (newDepartamento.id) {
      setDepartamentosData(prevDepartamentos =>
        prevDepartamentos.map(dep =>
          dep.id === newDepartamento.id ? newDepartamento : dep
        )
      )
      setIsDepartamentoDialogOpen(false)
      setNewDepartamento({ id: "", nombre: "", director: "" })
      setIsEditMode(false)
    }
  }

  const handleDeleteCareer = (sedeId: string, careerId: number) => {
    setSelectedSedes(prevSedes =>
      prevSedes.map(sede =>
        sede.id === sedeId
          ? { ...sede, careers: sede.careers.filter(c => c.id !== careerId) }
          : sede
      )
    )
  }

  const handleSelectSede = (value: string) => {
    if (!isEditing) return;
    const selectedSede = sedes.find(sede => sede.id === value)
    if (selectedSede && !selectedSedes.some(sede => sede.id === value)) {
      const newSedeData: SedeData = {
        id: selectedSede.id,
        name: selectedSede.name,
        careers: []
      }
      setSelectedSedes([...selectedSedes, newSedeData])
    }
  }

  const handleCreateSede = () => {
    if (newSede.name.trim() !== "") {
      const createdSede: Sede = {
        ...newSede,
        id: newSede.name.toLowerCase().replace(/\s+/g, '-'),
      }
      setSedes([...sedes, createdSede])
      setNewSede({
        id: "",
        name: "",
        city: "",
        department: "",
        studentCount: 0
      })
      setIsSedeDialogOpen(false)
    }
  }

  const handleSedeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSede(prev => ({
      ...prev,
      [name]: name === "studentCount" ? parseInt(value) || 0 : value
    }))
  }

  const handleCloseDepartamentoDialog = () => {
    setIsDepartamentoDialogOpen(false)
    setIsEditMode(false)
    setNewDepartamento({ id: "", nombre: "", director: "" })
  }

  return (
    <div id={name} className="mb-6">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-green-800">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-green-700 hover:text-green-800 hover:bg-green-100">
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-green-700 hover:text-green-800 hover:bg-green-100">
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-green-700">Departamentos de la Facultad</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-green-700">Departamento</TableHead>
                      <TableHead  className="text-green-700">Director</TableHead>
                      <TableHead className="text-green-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departamentosData.map((dep) => (
                      <TableRow key={dep.id}>
                        <TableCell>{dep.nombre}</TableCell>
                        <TableCell>{dep.director}</TableCell>
                        <TableCell>
                          {isEditing && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleEditDepartamento(dep)} 
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleRemoveDepartamentoRow(dep.id)} 
                                className="text-green-700 hover:text-green-800 hover:bg-green-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button 
                  variant="outline" 
                  onClick={handleAddDepartamento} 
                  className={`mt-4 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${
                    isEditing ? '' : 'hidden'
                  }`}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Departamento
                </Button>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2 text-green-700">Sedes de la Facultad</h3>
                <div className="flex space-x-4 mb-4">
                  <Select onValueChange={handleSelectSede} disabled={!isEditing}>
                    <SelectTrigger className="w-[200px] border-green-300 focus:border-green-500">
                      <SelectValue placeholder="Selecciona una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sedes.map((sede) => (
                        <SelectItem key={sede.id} value={sede.id}>
                          {sede.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Dialog open={isSedeDialogOpen} onOpenChange={setIsSedeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className={`bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${isEditing ? '' : 'hidden'}`} disabled={!isEditing}>Crear Nueva Sede</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-green-50">
                      <DialogHeader>
                        <DialogTitle className="text-green-700">Crear Nueva Sede</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right text-green-700">
                            Nombre
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={newSede.name}
                            onChange={handleSedeInputChange}
                            className="col-span-3 border-green-300 focus:border-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="city" className="text-right text-green-700">
                            Ciudad
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            value={newSede.city}
                            onChange={handleSedeInputChange}
                            className="col-span-3 border-green-300 focus:border-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="department" className="text-right text-green-700">
                            Departamento
                          </Label>
                          <Input
                            id="department"
                            name="department"
                            value={newSede.department}
                            onChange={handleSedeInputChange}
                            className="col-span-3 border-green-300 focus:border-green-500"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="studentCount" className="text-right text-green-700">
                            Estudiantes
                          </Label>
                          <Input
                            id="studentCount"
                            name="studentCount"
                            type="number"
                            value={newSede.studentCount}
                            onChange={handleSedeInputChange}
                            className="col-span-3 border-green-300 focus:border-green-500"
                          />
                        </div>
                      </div>
                      <Button onClick={handleCreateSede} className="bg-green-600 text-white hover:bg-green-700" disabled={!isEditing}>Crear Sede</Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-green-700">Carreras que ofrece la Facultad por sede</h3>
                {selectedSedes.map((sede) => (
                  <div key={sede.id} className="border border-green-200 rounded-lg p-4 space-y-2 mt-4">
                    <h4 className="text-xl font-bold text-green-700">{sede.name}</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-green-700">Carrera</TableHead>
                          <TableHead className="text-green-700">Coordinador</TableHead>
                          <TableHead className="text-green-700">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sede.careers.map((career) => (
                          <TableRow key={career.id}>
                            <TableCell>{career.name}</TableCell>
                            <TableCell>{career.coordinator}</TableCell>
                            <TableCell>
                              {isEditing && (
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleEditCareer(sede.id, career)} 
                                    className="text-green-700 hover:text-green-800 hover:bg-green-100"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => handleDeleteCareer(sede.id, career.id)} 
                                    className="text-green-700 hover:text-green-800 hover:bg-green-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAddCareer(sede.id)} 
                      className={`bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 ${
                        isEditing ? '' : 'hidden'
                      }`}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agregar Carrera
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleSave} 
                className={`mt-4 bg-green-600 text-white hover:bg-green-700 ${
                  isEditing ? '' : 'hidden'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCareerDialogOpen} onOpenChange={setIsCareerDialogOpen}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">{isEditMode ? "Editar Carrera" : "Agregar Carrera"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isEditMode && (
              <RadioGroup defaultValue="select" onValueChange={(value) => setCareerMode(value as "select" | "create")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="select" id="select" />
                  <Label htmlFor="select" className="text-green-700">Seleccionar carrera existente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="create" />
                  <Label htmlFor="create" className="text-green-700">Crear nueva carrera</Label>
                </div>
              </RadioGroup>
            )}

            {(careerMode === "select" && !isEditMode) ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="career" className="text-right text-green-700">
                  Carrera
                </Label>
                <Select onValueChange={handleCareerSelect}>
                  <SelectTrigger className="w-[180px] border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Selecciona una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCareers.map((career) => (
                      <SelectItem key={career.id} value={career.id.toString()}>
                        {career.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newCareerName" className="text-right text-green-700">
                    Nombre
                  </Label>
                  <Input
                    id="newCareerName"
                    name="name"
                    value={newCareer.name}
                    onChange={handleNewCareerChange}
                    className="col-span-3 border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newCareerCoordinator" className="text-right text-green-700">
                    Coordinador
                  </Label>
                  <Input
                    id="newCareerCoordinator"
                    name="coordinator"
                    value={newCareer.coordinator}
                    onChange={handleNewCareerChange}
                    className="col-span-3 border-green-300 focus:border-green-500"
                  />
                </div>
              </>
            )}
          </div>
          <Button onClick={isEditMode ? handleConfirmEditCareer : handleConfirmAddCareer} className="bg-green-600 text-white hover:bg-green-700" disabled={!isEditing}>
            {isEditMode ? "Guardar Cambios" : "Agregar Carrera"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDepartamentoDialogOpen} onOpenChange={handleCloseDepartamentoDialog}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">{isEditMode ? "Editar Departamento" : "Agregar Departamento"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isEditMode && (
              <RadioGroup defaultValue="select" onValueChange={(value) => setDepartamentoMode(value as "select" | "create")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="select" id="selectDepartamento" />
                  <Label htmlFor="selectDepartamento" className="text-green-700">Seleccionar departamento existente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="createDepartamento" />
                  <Label htmlFor="createDepartamento" className="text-green-700">Crear nuevo departamento</Label>
                </div>
              </RadioGroup>
            )}

            {(departamentoMode === "select" && !isEditMode) ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departamento" className="text-right text-green-700">
                  Departamento
                </Label>
                <Select onValueChange={handleDepartamentoSelect}>
                  <SelectTrigger className="w-[180px] border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Selecciona un departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartamentos.map((departamento) => (
                      <SelectItem key={departamento.id} value={departamento.id}>
                        {departamento.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newDepartamentoNombre" className="text-right text-green-700">
                    Nombre
                  </Label>
                  <Input
                    id="newDepartamentoNombre"
                    name="nombre"
                    value={newDepartamento.nombre}
                    onChange={handleNewDepartamentoChange}
                    className="col-span-3 border-green-300 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newDepartamentoDirector" className="text-right text-green-700">
                    Director
                  </Label>
                  <Input
                    id="newDepartamentoDirector"
                    name="director"
                    value={newDepartamento.director}
                    onChange={handleNewDepartamentoChange}
                    className="col-span-3 border-green-300 focus:border-green-500"
                  />
                </div>
              </>
            )}
          </div>
          <Button onClick={isEditMode ? handleConfirmEditDepartamento : handleConfirmAddDepartamento} className="bg-green-600 text-white hover:bg-green-700" disabled={!isEditing}>
            {isEditMode ? "Guardar Cambios" : "Agregar Departamento"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}