"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type User = {
  id: number
  name: string
  email: string
  role: string
}

const initialUsers: User[] = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "Administrador" },
  { id: 2, name: "María García", email: "maria@example.com", role: "Docente" },
  { id: 3, name: "Carlos López", email: "carlos@example.com", role: "Estudiante" },
]

export function Page() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")

  const filterUsers = useCallback(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      (roleFilter === "" || user.role === roleFilter)
    )
    setFilteredUsers(filtered)
  }, [users, nameFilter, roleFilter])

  useEffect(() => {
    filterUsers()
  }, [filterUsers])

  const addUser = (user: Omit<User, "id">) => {
    const newUser = { ...user, id: users.length + 1 }
    setUsers(prevUsers => [...prevUsers, newUser])
    setIsDialogOpen(false)
  }

  const updateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user))
    setEditingUser(null)
    setIsDialogOpen(false)
  }

  const deleteUser = (id: number) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id))
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
              <SelectItem value="">Todos los roles</SelectItem>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Docente">Docente</SelectItem>
              <SelectItem value="Estudiante">Estudiante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-green-200">
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id} className="hover:bg-green-100">
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
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
                  onClick={() => deleteUser(user.id)}
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

function UserForm({ onSubmit, initialData, onCancel }: {
  onSubmit: (user: User) => void
  initialData?: User | null
  onCancel: () => void
}) {
  const [name, setName] = useState(initialData?.name || "")
  const [email, setEmail] = useState(initialData?.email || "")
  const [role, setRole] = useState(initialData?.role || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, email, role, id: initialData?.id || 0 })
    setName("")
    setEmail("")
    setRole("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Rol</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Administrador">Administrador</SelectItem>
            <SelectItem value="Docente">Docente</SelectItem>
            <SelectItem value="Estudiante">Estudiante</SelectItem>
          </SelectContent>
        </Select>
      </div>
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