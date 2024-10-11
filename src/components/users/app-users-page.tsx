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
import { PlusCircle, Edit, Trash2, Users, ChevronUp, ChevronDown } from "lucide-react"
import { Notification } from "@/components/users/components-notification"
import { Pagination } from "@/components/users/components-pagination"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Tipos
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

// Esquema Zod
const userFormSchema = z.object({
  firstName: z.string().nonempty("El nombre es requerido"),
  lastName: z.string().nonempty("El apellido es requerido"),
  email: z.string().email("Email inválido"),
  username: z.string().nonempty("El nombre de usuario es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  roleId: z.number().int().positive("Debe seleccionar un rol"),
  facultyId: z.number().int().positive("Debe seleccionar una facultad").optional(),
})

// Componente de diálogo de confirmación de eliminación
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
            ¿Estás seguro de que deseas eliminar al usuario <strong>{userName}</strong>?
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

// Componente de filtro avanzado
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
              <SelectContent>
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
              <SelectContent>
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

// Componente de formulario de usuario
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

// Componente principal de gestión de usuarios
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
  const [showDeletedUsers, setShowDeletedUsers] = useState(false)

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingUser(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    fetchRoles()
    fetchFaculties()
    if (showDeletedUsers) {
      fetchDeletedUsers()
    } else {
      fetchUsers()
    }
  }, [showDeletedUsers])

  // Función para obtener usuarios activos
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data: User[] = await response.json()
        const activeUsers = data.filter(user => !user.isDeleted)
        setUsers(activeUsers)
        setFilteredUsers(activeUsers)
        setTotalPages(Math.ceil(activeUsers.length / 10))
      } else {
        const errorData = await response.json();
        console.error("Error al obtener usuarios:", errorData);
        setNotification({ message: errorData.error || "Error al obtener usuarios", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener usuarios", error)
      setNotification({ message: "Error al obtener usuarios", type: "error" })
    }
  }

  // Función para obtener usuarios eliminados
  const fetchDeletedUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/deleted`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data: User[] = await response.json()
        setUsers(data)
        setFilteredUsers(data)
        setTotalPages(Math.ceil(data.length / 10))
      } else {
        const errorData = await response.json();
        console.error('Error al obtener usuarios eliminados:', errorData);
        setNotification({ message: errorData.error || 'Error al obtener usuarios eliminados', type: 'error' })
      }
    } catch (error) {
      console.error('Error al obtener usuarios eliminados', error)
      setNotification({ message: 'Error al obtener usuarios eliminados', type: 'error' })
    }
  }

  // Función para obtener roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roles`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data: Role[] = await response.json()
        setRoles(data)
      } else {
        const errorData = await response.json();
        console.error("Error al obtener roles:", errorData);
        setNotification({ message: errorData.error || "Error al obtener roles", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener roles", error)
      setNotification({ message: "Error al obtener roles", type: "error" })
    }
  }

  // Función para obtener facultades
  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faculties`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data: Faculty[] = await response.json()
        setFaculties(data)
      } else {
        const errorData = await response.json();
        console.error("Error al obtener facultades:", errorData);
        setNotification({ message: errorData.error || "Error al obtener facultades", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener facultades", error)
      setNotification({ message: "Error al obtener facultades", type: "error" })
    }
  }

  // Función para filtrar usuarios
  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = users.filter(user =>
      (filters.name === "" || user.firstName.toLowerCase().includes(filters.name.toLowerCase()) || user.lastName.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.email === "" || user.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (filters.roleId === "all" || user.roleId.toString() === filters.roleId) &&
      (filters.facultyId === "all" || user.facultyId?.toString() === filters.facultyId)
    )
    setFilteredUsers(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [users])

  // Función para agregar un nuevo usuario
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
        const errorData = await response.json();
        console.error("Error al agregar usuario:", errorData);
        setNotification({ message: errorData.error || "Error al agregar usuario", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar usuario", error)
      setNotification({ message: "Error al agregar usuario", type: "error" })
    }
  }

  // Función para actualizar un usuario existente
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
        if (showDeletedUsers) {
          await fetchDeletedUsers()
        } else {
          await fetchUsers()
        }
        setEditingUser(null)
        setIsDialogOpen(false)
        setNotification({ message: "Usuario actualizado exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar usuario:", errorData);
        setNotification({ message: errorData.error || "Error al actualizar usuario", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar usuario", error)
      setNotification({ message: "Error al actualizar usuario", type: "error" })
    }
  }

  // Función para eliminar un usuario
  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: "DELETE",
        credentials: 'include'
      })
      if (response.ok) {
        if (showDeletedUsers) {
          await fetchDeletedUsers()
        } else {
          await fetchUsers()
        }
        setNotification({ message: "Usuario eliminado exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar usuario:", errorData);
        setNotification({ message: errorData.error || "Error al eliminar usuario", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar usuario", error)
      setNotification({ message: "Error al eliminar usuario", type: "error" })
    }
  }

  // Función para restaurar un usuario eliminado usando la nueva ruta de restauración
  const restoreUser = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/restore`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        // No es necesario enviar un cuerpo si la lógica de restauración está en el backend
        // body: JSON.stringify({ isDeleted: false })
      });

      // Obtener y mostrar la respuesta completa
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        // Refrescar la lista de usuarios según la vista actual
        if (showDeletedUsers) {
          await fetchDeletedUsers();
        } else {
          await fetchUsers();
        }
        setNotification({ message: "Usuario restaurado exitosamente", type: "success" });
      } else {
        console.error("Error al restaurar usuario:", responseData);
        setNotification({ message: responseData.error || "Error al restaurar usuario", type: "error" });
      }
    } catch (error) {
      console.error("Error al restaurar usuario:", error);
      setNotification({ message: "Error al restaurar usuario", type: "error" });
    }
  }

  // Manejar clic en eliminar
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.userId)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  // Ordenar usuarios
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

  // Cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Paginación
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
              <Button className="text-white">
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

          <Button
            className="text-white"
            onClick={() => setShowDeletedUsers(!showDeletedUsers)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showDeletedUsers ? 'Ver Usuarios Activos' : 'Ver Usuarios Eliminados'}
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
              <TableRow>
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
                <TableRow key={user.userId}>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{roles.find(role => role.roleId === user.roleId)?.roleName || 'N/A'}</TableCell>
                  <TableCell>{faculties.find(faculty => faculty.facultyId === user.facultyId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!showDeletedUsers && (
                        <>
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
                        </>
                      )}
                      {showDeletedUsers && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreUser(user.userId)}
                          className="border-primary text-primary hover:bg-green-50"
                        >
                          Restaurar
                        </Button>
                      )}
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
