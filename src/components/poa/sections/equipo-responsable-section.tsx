'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Trash2, PlusCircle, Save, Edit, Loader2, UserPlus } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod'
import { SectionProps } from '../poa-dashboard-main';


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
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.number().int().positive(),
  facultyId: z.number().int().positive(),
})

export function EquipoResponsableSectionComponent({ name, isActive, poaId, facultyId }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [roles, setRoles] = useState<Role[]>([])
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    roleId: 0,
    facultyId: facultyId, // Assuming a default facultyId
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        credentials: 'include'
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
        credentials: 'include'
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
        credentials: 'include'
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

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Here you would typically send the updated team members to the backend
      // For now, we'll just simulate an API call
      // await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
      toast({
        title: "Éxito",
        description: "Cambios guardados correctamente.",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poaId, userId: parseInt(selectedUserId) }),
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to add team member')
      await fetchTeamMembers() // Refresh the team members list
      setIsDialogOpen(false)
      toast({
        title: "Éxito",
        description: "Miembro agregado correctamente.",
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
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to remove team member')
      await fetchTeamMembers() // Refresh the team members list
      toast({
        title: "Éxito",
        description: "Miembro removido correctamente.",
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

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.name === 'roleId' ? parseInt(e.target.value) : e.target.value,
    })
  }

  const handleCreateNewUser = async () => {
    setIsLoading(true)
    try {
      const validatedData = createUserSchema.parse(newUser)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to create new user')
      await fetchAllUsers() // Refresh the users list
      setIsNewUserDialogOpen(false)
      toast({
        title: "Éxito",
        description: "Usuario creado correctamente.",
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
          <h2 className="text-xl font-semibold text-green-800 mb-2 sm:mb-0">{name}</h2>
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      onClick={handleAddMember}
                      className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agregar Miembro
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsNewUserDialogOpen(true)}
                      className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
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
                        <TableHead className="text-green-700">Nombre</TableHead>
                        <TableHead className="text-green-700">Correo electrónico</TableHead>
                        <TableHead className="text-green-700">Nombre de usuario</TableHead>
                        {isEditing && <TableHead className="text-green-700">Acciones</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.username}>
                          <TableCell>{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.username}</TableCell>
                          {isEditing && (
                            <TableCell>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveMember(member.userId)}
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
              </div>
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="mt-4 bg-green-600 text-white hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Cambios
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="bg-green-50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-700">Agregar Miembro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member" className="text-right text-green-700">
                Miembro
              </Label>
              <Select onValueChange={handleSelectChange} value={selectedUserId}>
                <SelectTrigger className="w-[180px] border-green-300 focus:border-green-500">
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
          <Button onClick={handleConfirmAddMember} className="bg-green-600 text-white hover:bg-green-700" disabled={isLoading || !selectedUserId}>
            {isLoading ? <Loader2 className="h-4  w-4 animate-spin" /> : "Agregar Miembro"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="bg-green-50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-700">Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right text-green-700">
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
              <Label htmlFor="lastName" className="text-right text-green-700">
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
              <Label htmlFor="email" className="text-right text-green-700">
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
              <Label htmlFor="username" className="text-right text-green-700">
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
              <Label htmlFor="password" className="text-right text-green-700">
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
              <Label htmlFor="roleId" className="text-right text-green-700">
                Rol
              </Label>
              <Select name="roleId" onValueChange={(value) => handleNewUserChange({ target: { name: 'roleId', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                <SelectTrigger className="w-[180px] border-green-300 focus:border-green-500">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.roleId} value={role.roleId.toString()}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreateNewUser} className="bg-green-600 text-white hover:bg-green-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Usuario"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}