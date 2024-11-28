// src/components/poa/sections/equipo-responsable-section.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Trash2, PlusCircle, Edit, Loader2, UserPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod'
import { SectionProps } from '../poa-dashboard-main';
import { useCurrentUser } from '@/hooks/use-current-user'

interface TeamMember {
  name: string
  userId: number
  roleId: number
  email: string
  username: string
  facultyId: number
}

interface User {
  userId: number
  firstName: string
  lastName: string
  email: string
  username: string
  roleId: number
  facultyId: number
}

interface Role {
  roleId: number
  roleName: string
}

const createUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Dirección de correo electrónico no válida'),
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  roleId: z.number().int().positive(),
  facultyId: z.number().int().positive(),
})

export function EquipoResponsableSectionComponent({ name, isActive, poaId, facultyId, isEditable }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const user = useCurrentUser();
  const [roles, setRoles] = useState<Role[]>([])
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    roleId: 4, // Establecer roleId a 4
    facultyId: facultyId, // Asumiendo un facultyId por defecto
  })
  const { toast } = useToast()

  useEffect(() => {
    if (!poaId) return
    fetchAllUsers()
    fetchTeamMembers()
    fetchRoles()
  }, [poaId])

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/proponent/${facultyId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setAllUsers(data)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios.",
        variant: "destructive",
      })
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams/poa/${poaId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch team members')
      const data = await response.json()
      setTeamMembers(data)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los miembros del equipo.",
        variant: "destructive",
      })
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los roles.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleAddMember = () => {
    setIsDialogOpen(true)
    setSelectedUserId("")
  }

  const handleConfirmAddMember = async () => {
    setIsLoading(true)
    try {
      if (!selectedUserId) {
        throw new Error('No user selected')
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams`, {
        method: 'POST',
        body: JSON.stringify({ poaId, userId: parseInt(selectedUserId) }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to add team member')
      await fetchTeamMembers() // Refresh the team members list
      setIsDialogOpen(false)
      toast({
        title: "Éxito",
        description: "Miembro agregado correctamente.",
        variant: "success",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar el miembro.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams/${poaId}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to remove team member')
      await fetchTeamMembers() // Refresh the team members list
      toast({
        title: "Éxito",
        description: "Miembro removido correctamente.",
        variant: "success",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo remover el miembro.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedUserId("")
  }

  const handleSelectChange = (value: string) => {
    setSelectedUserId(value)
  }

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    })
  }

  const handleCreateNewUser = async () => {
    setIsLoading(true)
    try {
      newUser.roleId = 4; // Asegurarse de que roleId siempre sea 4
      const validatedData = createUserSchema.parse(newUser)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`, {
        method: 'POST',
        body: JSON.stringify(validatedData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to create new user')
      const createdUser = await response.json()
      // Añadir el usuario al equipo
      const addMemberResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams`, {
        method: 'POST',
        body: JSON.stringify({ poaId, userId: createdUser.userId }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      })
      if (!addMemberResponse.ok) throw new Error('Failed to add new user to team')
      await fetchAllUsers() // Actualizar la lista de usuarios
      await fetchTeamMembers() // Actualizar la lista de miembros del equipo
      setIsNewUserDialogOpen(false)
      toast({
        title: "Éxito",
        description: "Usuario creado y agregado al equipo correctamente.",
        variant: "success",
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el usuario.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id={name} className="mb-6">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
        <div className="p-4 bg-green-50 flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-semibold text-primary mb-2 sm:mb-0">{name}</h2>
          <div className="flex items-center space-x-2">
            {isEditable && (
              <Button variant="ghost" size="sm" onClick={handleEdit} className="text-primary hover:text-primary hover:bg-green-100">
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Finalizar edición" : "Editar"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-primary hover:text-primary hover:bg-green-100">
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-primary">Miembros del Equipo Responsable</h3>
                {isEditing && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      onClick={handleAddMember}
                      className="bg-green-50 text-primary hover:bg-green-100 hover:text-primary"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agregar Miembro
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewUserDialogOpen(true)}
                      className="bg-green-50 text-primary hover:bg-green-100 hover:text-primary"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Crear Nuevo Usuario
                    </Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-black">Nombre</TableHead>
                        <TableHead className="text-black">Correo electrónico</TableHead>
                        <TableHead className="text-black">Nombre de usuario</TableHead>
                        <TableHead className="text-black">Rol</TableHead> {/* Columna de Rol */}
                        {isEditing && <TableHead className="text-black">Acciones</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => {
                        const role = roles.find(r => r.roleId === member.roleId)?.roleName || 'Desconocido'
                        return (
                          <TableRow key={member.username}>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.username}</TableCell>
                            <TableCell>{role}</TableCell> {/* Mostrar el nombre del rol */}
                            {isEditing && (
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRemoveMember(member.userId)}
                                  className="text-primary hover:text-primary hover:bg-green-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogo para agregar miembro existente */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-green-50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">Agregar Miembro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member" className="text-right text-black">
                Miembro
              </Label>
              <Select onValueChange={handleSelectChange} value={selectedUserId}>
                <SelectTrigger className="w-[180px] border-primary focus:border-green-500">
                  <SelectValue placeholder="Selecciona un miembro" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((user) => (
                    <SelectItem key={user.userId} value={user.userId.toString()}>
                      {`${user.firstName} ${user.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleConfirmAddMember} className="bg-primary text-white hover:bg-green-700" disabled={isLoading || !selectedUserId}>
            {isLoading ? <Loader2 className="h-4  w-4 animate-spin" /> : "Agregar Miembro"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialogo para crear nuevo usuario */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="bg-green-50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right text-black">
                Nombre
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={newUser.firstName}
                onChange={handleNewUserChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right text-black">
                Apellido
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={newUser.lastName}
                onChange={handleNewUserChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-black">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right text-black">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                name="username"
                value={newUser.username}
                onChange={handleNewUserChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right text-black">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right text-black">
                Rol
              </Label>
              <Input
                value="Formulador"
                readOnly
                className="col-span-3 bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
          <Button onClick={handleCreateNewUser} className="bg-primary text-white hover:bg-green-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Usuario"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
