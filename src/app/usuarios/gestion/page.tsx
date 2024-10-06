"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusCircle, Edit, Trash2, Users, ChevronUp, ChevronDown, X } from "lucide-react"
import { Notification } from "@/components/components-notification"
import { Pagination } from "@/components/components-pagination"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Types
type User = {
  userId: number
  firstName: string
  lastName: string
  email: string
  username: string
  roleId: number
  facultyId?: number
  isDeleted: boolean
}

type UserFormData = {
  firstName: string
  lastName: string
  email: string
  username: string
  password?: string
  roleId: number
  facultyId?: number
}

type Role = {
  roleId: number
  roleName: string
}

type Faculty = {
  facultyId: number
  name: string
}

type SortableUserKey = keyof Pick<User, 'firstName' | 'lastName' | 'email' | 'username' | 'roleId' | 'facultyId'>

// Zod schema
const userFormSchema = z.object({
  firstName: z.string().nonempty("El nombre es requerido"),
  lastName: z.string().nonempty("El apellido es requerido"),
  email: z.string().email("Email inválido"),
  username: z.string().nonempty("El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  roleId: z.number().int().positive("Debe seleccionar un rol"),
  facultyId: z.number().int().positive("Debe seleccionar una facultad").optional(),
})

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  userName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar al usuario {userName}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AdvancedFilter({
  onFilter,
  roles,
  faculties
}: {
  onFilter: (filters: any) => void
  roles: Role[]
  faculties: Faculty[]
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState("all")
  const [facultyId, setFacultyId] = useState("all")

  useEffect(() => {
    onFilter({ name, email, roleId, facultyId })
  }, [name, email, roleId, facultyId, onFilter])

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="name-filter">Nombre</Label>
            <Input
              id="name-filter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Filtrar por nombre"
            />
          </div>
          <div>
            <Label htmlFor="email-filter">Email</Label>
            <Input
              id="email-filter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Filtrar por email"
            />
          </div>
          <div>
            <Label htmlFor="role-filter">Rol</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent> {/* Sin modal={false} */}
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.roleId} value={role.roleId.toString()}>
                    {role.roleName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="faculty-filter">Facultad</Label>
            <Select value={facultyId} onValueChange={setFacultyId}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las facultades" />
              </SelectTrigger>
              <SelectContent> {/* Sin modal={false} */}
                <SelectItem value="all">Todas las facultades</SelectItem>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.facultyId} value={faculty.facultyId.toString()}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


function UserForm({
  onSubmit,
  initialData,
  onCancel,
  roles,
  faculties
}: {
  onSubmit: (data: UserFormData) => Promise<void>
  initialData?: User | null
  onCancel: () => void
  roles: Role[]
  faculties: Faculty[]
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      username: initialData.username,
      roleId: initialData.roleId,
      facultyId: initialData.facultyId
    } : {}
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="username">Nombre de usuario</Label>
          <Input id="username" {...register("username")} />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>
      </div>
      {!initialData && (
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="roleId">Rol</Label>
          <Controller
            name="roleId"
            control={control}
            rules={{ required: "Debe seleccionar un rol" }}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                value={field.value !== undefined ? field.value.toString() : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.roleId} value={role.roleId.toString()}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.roleId && <p className="text-red-500 text-sm">{errors.roleId.message}</p>}
        </div>
        <div>
          <Label htmlFor="facultyId">Facultad</Label>
          <Controller
            name="facultyId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                value={field.value !== undefined ? field.value.toString() : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar facultad" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.facultyId} value={faculty.facultyId.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.facultyId && <p className="text-red-500 text-sm">{errors.facultyId.message}</p>}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"} Usuario
        </Button>
      </div>
    </form>
  )
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: SortableUserKey;
    direction: 'ascending' | 'descending';
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingUser(null)
    }
  }, [isDialogOpen])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`,
        {credentials: 'include'}
      )
      if (response.ok) {
        const data: User[] = await response.json()
        setUsers(data)
        setFilteredUsers(data.filter(user => !user.isDeleted))
        setTotalPages(Math.ceil(data.filter(user => !user.isDeleted).length / 10))
      } else {
        console.error("Error al obtener usuarios")
      }
    } catch (error) {
      console.error("Error al obtener usuarios", error)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles`,
        {credentials: 'include'}
      )
      if (response.ok) {
        const data: Role[] = await response.json()
        setRoles(data)
      } else {
        console.error("Error al obtener roles")
      }
    } catch (error) {
      console.error("Error al obtener roles", error)
    }
  }

  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faculties`,
        {credentials: 'include'}
      )
      if (response.ok) {
        const data: Faculty[] = await response.json()
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

  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = users.filter(user => 
      !user.isDeleted &&
      (filters.name === "" || user.firstName.toLowerCase().includes(filters.name.toLowerCase()) || user.lastName.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.email === "" || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (filters.roleId === "all" || user.roleId.toString() === filters.roleId) &&
      (filters.facultyId === "all" || user.facultyId?.toString() === filters.facultyId)
    )
    setFilteredUsers(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [users])

  const addUser = async (data: UserFormData) => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchUsers()
        setIsDialogOpen(false)
        setNotification({ message: "Usuario agregado exitosamente", type: "success" })
      } else {
        console.error("Error al agregar usuario")
        setNotification({ message: "Error al agregar usuario", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar usuario", error)
      setNotification({ message: "Error al agregar usuario", type: "error" })
    }
  }

  const updateUser = async (data: UserFormData) => {
    if (!editingUser) return
    try {
      const response = await fetch(`${API_URL}/api/users/${editingUser.userId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchUsers()
        setEditingUser(null)
        setIsDialogOpen(false)
        setNotification({ message: "Usuario actualizado exitosamente", type: "success" })
      } else {
        console.error("Error al actualizar usuario")
        setNotification({ message: "Error al actualizar usuario", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar usuario", error)
      setNotification({ message: "Error al actualizar usuario", type: "error" })
    }
  }

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        credentials: 'include'
      })
      if (response.ok) {
        await fetchUsers()
        setNotification({ message: "Usuario eliminado exitosamente", type: "success" })
      } else {
        console.error("Error al eliminar usuario")
        setNotification({ message: "Error al eliminar usuario", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar usuario", error)
      setNotification({ message: "Error al eliminar usuario", type: "error" })
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.userId)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const requestSort = (key: SortableUserKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aValue = a[key] !== undefined ? a[key] : (typeof a[key] === 'number' ? 0 : '')
      const bValue = b[key] !== undefined ? b[key] : (typeof b[key] === 'number' ? 0 : '')

      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(sortedUsers);
  };

  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className=" text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
                <DialogDescription>
                  {editingUser ? "Actualiza la información del usuario." : "Completa la información para agregar un nuevo usuario."}
                </DialogDescription>
              </DialogHeader>
              <UserForm
                onSubmit={editingUser ? updateUser : addUser}
                initialData={editingUser}
                onCancel={() => setIsDialogOpen(false)}
                roles={roles}
                faculties={faculties}
              />
            </DialogContent>
          </Dialog>
          
          <Button className="text-white">
            <Users className="mr-2 h-4 w-4" />
            Ver Usuarios Eliminados
          </Button>
        </div>

        <AdvancedFilter
          onFilter={handleAdvancedFilter}
          roles={roles}
          faculties={faculties}
        />

        <div className="rounded-md border mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('firstName')}>
                  Nombre
                  {sortConfig?.key === 'firstName' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('lastName')}>
                  Apellido
                  {sortConfig?.key === 'lastName' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('email')}>
                  Email
                  {sortConfig?.key === 'email' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('username')}>
                  Usuario
                  {sortConfig?.key === 'username' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('roleId')}>
                  Rol
                  {sortConfig?.key === 'roleId' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('facultyId')}>
                  Facultad
                  {sortConfig?.key === 'facultyId' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.userId} className="">
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{roles.find(role => role.roleId === user.roleId)?.roleName || 'N/A'}</TableCell>
                  <TableCell>{faculties.find(faculty => faculty.facultyId === user.facultyId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary text-primary hover:bg-green-50"
                        onClick={() => {
                          setEditingUser(user)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteClick(user)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          userName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ''}
        />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
          />
        )}
      </CardContent>
    </Card>
  )
}