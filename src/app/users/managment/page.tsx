// src/app/users/managment/page.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Definición del tipo de usuario tal como se maneja en la API
type User = {
  userId: number
  firstName: string
  lastName: string
  email: string
  username: string
  roleId: number
  facultyId?: number
  isDeleted: boolean // Nuevo campo
}

// Definición del tipo de datos para el formulario
type UserFormData = {
  firstName: string
  lastName: string
  email: string
  username: string
  password?: string // Opcional, solo necesario al crear o actualizar
  roleId: number
  facultyId?: number
  // Eliminado el campo status
}

type Role = {
  roleId: number
  roleName: string
}

type Faculty = {
  facultyId: number
  name: string
  // Otros campos si es necesario
}

// Esquema de validación con zod
const userFormSchema = z.object({
  firstName: z.string().nonempty("El nombre es requerido"),
  lastName: z.string().nonempty("El apellido es requerido"),
  email: z.string().email("Email inválido"),
  username: z.string().nonempty("El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  roleId: z.number().int().positive("Debe seleccionar un rol"),
  facultyId: z.number().int().positive("Debe seleccionar una facultad").optional(),
  // Eliminado el campo status
})

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("all") // Inicializado en "all"

  // Función para obtener usuarios de la API
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error("Error al obtener usuarios")
      }
    } catch (error) {
      console.error("Error al obtener usuarios", error)
    }
  }

  // Función para obtener roles de la API
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles`)
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        console.error("Error al obtener roles")
      }
    } catch (error) {
      console.error("Error al obtener roles", error)
    }
  }

  // Función para obtener facultades de la API
  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faculties`)
      if (response.ok) {
        const data = await response.json()
        setFaculties(data)
      } else {
        console.error("Error al obtener facultades")
      }
    } catch (error) {
      console.error("Error al obtener facultades", error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchFaculties()
  }, [])

  const filterUsers = useCallback(() => {
    const filtered = users.filter(user => 
      !user.isDeleted && // Excluir usuarios eliminados
      (user.firstName.toLowerCase().includes(nameFilter.toLowerCase()) ||
       user.lastName.toLowerCase().includes(nameFilter.toLowerCase())) &&
      (roleFilter === "all" || user.roleId.toString() === roleFilter)
    )
    setFilteredUsers(filtered)
  }, [users, nameFilter, roleFilter])

  useEffect(() => {
    filterUsers()
  }, [filterUsers])

  // Función para agregar usuario
  const addUser = async (data: UserFormData) => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchUsers()
        setIsDialogOpen(false)
      } else {
        console.error("Error al agregar usuario")
      }
    } catch (error) {
      console.error("Error al agregar usuario", error)
    }
  }

  // Función para actualizar usuario
  const updateUser = async (data: UserFormData) => {
    if (!editingUser) return
    try {
      const response = await fetch(`${API_URL}/api/users/${editingUser.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchUsers()
        setEditingUser(null)
        setIsDialogOpen(false)
      } else {
        console.error("Error al actualizar usuario")
      }
    } catch (error) {
      console.error("Error al actualizar usuario", error)
    }
  }

  // Función para eliminar usuario (soft delete)
  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE"
        // Asumiendo que la API maneja la eliminación suave estableciendo isDeleted a true
      })
      if (response.ok) {
        await fetchUsers()
      } else {
        console.error("Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error al eliminar usuario", error)
    }
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-green-800">Gestión de Usuarios</h2>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 bg-green-600 hover:bg-green-700">Agregar Usuario</Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={editingUser ? updateUser : addUser}
            initialData={editingUser}
            onCancel={() => {
              setEditingUser(null)
              setIsDialogOpen(false)
            }}
            roles={roles}
            faculties={faculties}
          />
        </DialogContent>
      </Dialog>

      <div className="mb-4 flex space-x-4">
        <div className="flex-1">
          <Label htmlFor="name-filter">Filtrar por nombre</Label>
          <Input
            id="name-filter"
            placeholder="Filtrar por nombre"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="role-filter">Filtrar por rol</Label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger id="role-filter" className="mt-1">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role.roleId} value={role.roleId.toString()}>{role.roleName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-green-200">
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Facultad</TableHead> {/* Nueva columna */}
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.userId} className="hover:bg-green-100">
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{roles.find(role => role.roleId === user.roleId)?.roleName || 'N/A'}</TableCell>
              <TableCell>{faculties.find(faculty => faculty.facultyId === user.facultyId)?.name || 'N/A'}</TableCell> {/* Mostrar nombre de la facultad */}
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 border-green-600 text-green-600 hover:bg-green-100"
                  onClick={() => {
                    setEditingUser(user)
                    setIsDialogOpen(true)
                  }}
                >
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteUser(user.userId)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

function UserForm({ onSubmit, initialData, onCancel, roles, faculties }: {
  onSubmit: (data: UserFormData) => Promise<void>
  initialData?: User | null
  onCancel: () => void
  roles: Role[]
  faculties: Faculty[]
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      username: initialData.username,
      roleId: initialData.roleId,
      facultyId: initialData.facultyId,
      // Password no se incluye al editar
    } : {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      roleId: roles.length > 0 ? roles[0].roleId : 0,
      facultyId: faculties.length > 0 ? faculties[0].facultyId : undefined,
    }
  })

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        username: initialData.username,
        roleId: initialData.roleId,
        facultyId: initialData.facultyId,
        // No se rellena el password al editar
      })
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        roleId: roles.length > 0 ? roles[0].roleId : 0,
        facultyId: faculties.length > 0 ? faculties[0].facultyId : undefined,
      })
    }
  }, [initialData, reset, roles, faculties])

  const submitHandler = async (data: UserFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div>
        <Label htmlFor="firstName">Nombre</Label>
        <Input
          id="firstName"
          placeholder="Nombre"
          {...register("firstName")}
        />
        {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
      </div>
      <div>
        <Label htmlFor="lastName">Apellido</Label>
        <Input
          id="lastName"
          placeholder="Apellido"
          {...register("lastName")}
        />
        {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          {...register("email")}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="username">Nombre de Usuario</Label>
        <Input
          id="username"
          placeholder="Nombre de Usuario"
          {...register("username")}
        />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
      </div>
      {/* Mostrar el campo contraseña solo al agregar usuario */}
      {!initialData && (
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="Contraseña"
            {...register("password")}
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>
      )}
      <div>
        <Label htmlFor="roleId">Rol</Label>
        <select
          id="roleId"
          {...register("roleId", { valueAsNumber: true })}
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          <option value="">Seleccione un rol</option>
          {roles.map(role => (
            <option key={role.roleId} value={role.roleId}>{role.roleName}</option>
          ))}
        </select>
        {errors.roleId && <p className="text-red-500">{errors.roleId.message}</p>}
      </div>
      <div>
        <Label htmlFor="facultyId">Facultad</Label>
        <select
          id="facultyId"
          {...register("facultyId", { valueAsNumber: true })}
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          <option value="">Seleccione una facultad</option>
          {faculties.map(faculty => (
            <option key={faculty.facultyId} value={faculty.facultyId}>{faculty.name}</option>
          ))}
        </select>
        {errors.facultyId && <p className="text-red-500">{errors.facultyId.message}</p>}
      </div>
      {/* Eliminado el campo status */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-green-600 text-green-600">
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {initialData ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  )
}
