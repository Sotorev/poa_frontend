"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown, ChevronUp, Plus, Trash2, PlusCircle, Save, Edit } from 'lucide-react'
import { Toast } from '@radix-ui/react-toast'

interface SectionProps {
  name: string
  isActive: boolean
  poaId: string | null
}

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  role: string
  faculty: string
}

export function EquipoResponsableSectionComponent({ name, isActive, poaId }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [allMembers, setAllMembers] = useState<TeamMember[]>([
    { id: "1", firstName: "Juan", lastName: "Pérez", email: "juan@example.com", username: "juanp", role: "Coordinador", faculty: "Ingeniería" },
    { id: "2", firstName: "María", lastName: "López", email: "maria@example.com", username: "marial", role: "Asistente", faculty: "Ciencias" },
  ])
  const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<TeamMember & { password: string }>({ 
    id: "", firstName: "", lastName: "", email: "", username: "", role: "", faculty: "", password: "" 
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [addMemberMode, setAddMemberMode] = useState<"select" | "create">("select")
  const [isEditMode, setIsEditMode] = useState(false)

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    Toast({
      title: "Cambios guardados",
    })
  }

  const handleAddMember = () => {
    setIsDialogOpen(true)
    setAddMemberMode("select")
    setNewMember({ id: "", firstName: "", lastName: "", email: "", username: "", role: "", faculty: "", password: "" })
    setIsEditMode(false)
  }

  const handleConfirmAddMember = () => {
    if (addMemberMode === "select") {
      const selectedMember = allMembers.find(member => member.id === newMember.id)
      if (selectedMember) {
        setSelectedMembers([...selectedMembers, selectedMember])
      }
    } else {
      if (newMember.firstName && newMember.lastName && newMember.email && newMember.username && newMember.role && newMember.faculty) {
        const newMemberWithId = { ...newMember, id: Date.now().toString() }
        setAllMembers([...allMembers, newMemberWithId])
        setSelectedMembers([...selectedMembers, newMemberWithId])
      }
    }
    setIsDialogOpen(false)
    setNewMember({ id: "", firstName: "", lastName: "", email: "", username: "", role: "", faculty: "", password: "" })
  }

  const handleRemoveMember = (id: string) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== id))
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditMode(false)
    setNewMember({ id: "", firstName: "", lastName: "", email: "", username: "", role: "", faculty: "", password: "" })
  }

  const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

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
                <h3 className="text-lg font-medium mb-2 text-green-700">Miembros del Equipo Responsable</h3>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={handleAddMember} 
                    className="mb-4 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar Miembro
                  </Button>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-green-700">Nombre</TableHead>
                      <TableHead className="text-green-700">Email</TableHead>
                      <TableHead className="text-green-700">Rol</TableHead>
                      {isEditing && <TableHead className="text-green-700">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        {isEditing && (
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleRemoveMember(member.id)} 
                              className="text-green-700 hover:text-green-800 hover:bg-green-100"
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
                <Button 
                  onClick={handleSave} 
                  className="mt-4 bg-green-600 text-white hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-green-700">{isEditMode ? "Editar Miembro" : "Agregar Miembro"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!isEditMode && (
              <RadioGroup defaultValue="select" onValueChange={(value) => setAddMemberMode(value as "select" | "create")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="select" id="select" />
                  <Label htmlFor="select" className="text-green-700">Seleccionar miembro existente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="create" id="create" />
                  <Label htmlFor="create" className="text-green-700">Crear nuevo miembro</Label>
                </div>
              </RadioGroup>
            )}

            {(addMemberMode === "select" && !isEditMode) ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="member" className="text-right text-green-700">
                  Miembro
                </Label>
                <Select onValueChange={(value) => setNewMember({...newMember, id: value})}>
                  <SelectTrigger className="w-[180px] border-green-300 focus:border-green-500">
                    <SelectValue placeholder="Selecciona un miembro" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {`${member.firstName} ${member.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-green-700">Nombre</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={newMember.firstName}
                      onChange={handleMemberChange}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-green-700">Apellido</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={newMember.lastName}
                      onChange={handleMemberChange}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-green-700">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newMember.email}
                    onChange={handleMemberChange}
                    className="border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-green-700">Nombre de usuario</Label>
                  <Input
                    id="username"
                    name="username"
                    value={newMember.username}
                    onChange={handleMemberChange}
                    className="border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                {!isEditMode && (
                  <div>
                    <Label htmlFor="password" className="text-green-700">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={newMember.password}
                      onChange={handleMemberChange}
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="role" className="text-green-700">Rol</Label>
                  <Select name="role" onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coordinador">Coordinador</SelectItem>
                      <SelectItem value="Asistente">Asistente</SelectItem>
                      <SelectItem value="Miembro">Miembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <Button onClick={handleConfirmAddMember} className="bg-green-600 text-white hover:bg-green-700">
            {isEditMode ? "Guardar Cambios" : "Agregar Miembro"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}