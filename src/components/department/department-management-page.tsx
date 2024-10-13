"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
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
type Department = {
  departmentId: number
  name: string
  facultyId?: number
  director: string
  isDeleted: boolean
}

type DepartmentFormData = {
  name: string
  facultyId?: number
  director: string
}

type Faculty = {
  facultyId: number
  name: string
}

type SortableDepartmentKey = keyof Pick<
  Department,
  'name' | 'director' | 'facultyId'
>

// Esquema Zod
const departmentFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  director: z.string().nonempty("El director es requerido"),
  facultyId: z.number().int().positive("Debe seleccionar una facultad").optional(),
})

// Componente de diálogo de confirmación de eliminación
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  departmentName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  departmentName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el departamento <strong>{departmentName}</strong>?
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
  faculties
}: {
  onFilter: (filters: any) => void
  faculties: Faculty[]
}) {
  const [name, setName] = useState("")
  const [director, setDirector] = useState("")
  const [facultyId, setFacultyId] = useState("all")

  useEffect(() => {
    onFilter({ name, director, facultyId })
  }, [name, director, facultyId, onFilter])

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Label htmlFor="director-filter">Director</Label>
            <Input
              id="director-filter"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              placeholder="Filtrar por director"
            />
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

// Componente de formulario de departamento
function DepartmentForm({
  onSubmit,
  initialData,
  onCancel,
  faculties
}: {
  onSubmit: (data: DepartmentFormData) => Promise<void>
  initialData?: Department | null
  onCancel: () => void
  faculties: Faculty[]
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      director: initialData.director,
      facultyId: initialData.facultyId,
    } : {}
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="director">Director</Label>
        <Input id="director" {...register("director")} />
        {errors.director && <p className="text-red-500 text-sm">{errors.director.message}</p>}
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
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"} Departamento
        </Button>
      </div>
    </form>
  )
}

// Componente principal de gestión de departamentos
export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: SortableDepartmentKey;
    direction: 'ascending' | 'descending';
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showDeletedDepartments, setShowDeletedDepartments] = useState(false)

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingDepartment(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    fetchFaculties()
    if (showDeletedDepartments) {
      fetchDeletedDepartments()
    } else {
      fetchDepartments()
    }
  }, [showDeletedDepartments])

  // Función para obtener departamentos activos
  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...')
      const response = await fetch(`${API_URL}/api/departments`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Department[] = await response.json()
        console.log('Response data:', data)
        const activeDepartments = data.filter(department => !department.isDeleted)
        setDepartments(activeDepartments)
        setFilteredDepartments(activeDepartments)
        setTotalPages(Math.ceil(activeDepartments.length / 10))
      } else {
        const errorData = await response.json()
        console.error("Error al obtener departamentos:", errorData)
        setNotification({ message: errorData.error || "Error al obtener departamentos", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener departamentos", error)
      setNotification({ message: "Error al obtener departamentos", type: "error" })
    }
  }

  // Función para obtener departamentos eliminados
  const fetchDeletedDepartments = async () => {
    try {
      console.log('Fetching deleted departments...')
      const response = await fetch(`${API_URL}/api/departments/deleted/history`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Department[] = await response.json()
        console.log('Response data:', data)
        setDepartments(data)
        setFilteredDepartments(data)
        setTotalPages(Math.ceil(data.length / 10))
      } else {
        const errorData = await response.json()
        console.error("Error al obtener departamentos eliminados:", errorData)
        setNotification({ message: errorData.error || "Error al obtener departamentos eliminados", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener departamentos eliminados", error)
      setNotification({ message: "Error al obtener departamentos eliminados", type: "error" })
    }
  }

  // Función para obtener facultades
  const fetchFaculties = async () => {
    try {
      console.log('Fetching faculties...')
      const response = await fetch(`${API_URL}/api/faculties`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Faculty[] = await response.json()
        console.log('Response data:', data)
        setFaculties(data)
      } else {
        const errorData = await response.json()
        console.error("Error al obtener facultades:", errorData)
        setNotification({ message: errorData.error || "Error al obtener facultades", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener facultades", error)
      setNotification({ message: "Error al obtener facultades", type: "error" })
    }
  }

  // Función para filtrar departamentos
  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = departments.filter(department =>
      (filters.name === "" || department.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.director === "" || department.director.toLowerCase().includes(filters.director.toLowerCase())) &&
      (filters.facultyId === "all" || department.facultyId?.toString() === filters.facultyId)
    )
    setFilteredDepartments(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [departments])

  // Función para agregar un nuevo departamento
  const addDepartment = async (data: DepartmentFormData) => {
    try {
      console.log('Adding department with data:', data)
      const response = await fetch(`${API_URL}/api/departments`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      console.log('Request:', response)
      if (response.ok) {
        await fetchDepartments()
        setIsDialogOpen(false)
        setNotification({ message: "Departamento agregado exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al agregar departamento:", errorData)
        setNotification({ message: errorData.error || "Error al agregar departamento", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar departamento", error)
      setNotification({ message: "Error al agregar departamento", type: "error" })
    }
  }

  // Función para actualizar un departamento existente
  const updateDepartment = async (data: DepartmentFormData) => {
    if (!editingDepartment) return
    try {
      console.log('Updating department with data:', data)
      const response = await fetch(`${API_URL}/api/departments/${editingDepartment.departmentId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      console.log('Request:', response)
      if (response.ok) {
        if (showDeletedDepartments) {
          await fetchDeletedDepartments()
        } else {
          await fetchDepartments()
        }
        setEditingDepartment(null)
        setIsDialogOpen(false)
        setNotification({ message: "Departamento actualizado exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al actualizar departamento:", errorData)
        setNotification({ message: errorData.error || "Error al actualizar departamento", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar departamento", error)
      setNotification({ message: "Error al actualizar departamento", type: "error" })
    }
  }

  // Función para eliminar un departamento
  const deleteDepartment = async (departmentId: number) => {
    try {
      console.log(`Deleting department with id: ${departmentId}`)
      const response = await fetch(`${API_URL}/api/departments/${departmentId}`, {
        method: "DELETE",
        credentials: 'include'
      })
      console.log('Request:', response)
      if (response.ok) {
        if (showDeletedDepartments) {
          await fetchDeletedDepartments()
        } else {
          await fetchDepartments()
        }
        setNotification({ message: "Departamento eliminado exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al eliminar departamento:", errorData)
        setNotification({ message: errorData.error || "Error al eliminar departamento", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar departamento", error)
      setNotification({ message: "Error al eliminar departamento", type: "error" })
    }
  }

  // Función para restaurar un departamento eliminado
  const restoreDepartment = async (departmentId: number) => {
    try {
      console.log(`Restoring department with id: ${departmentId}`)
      const response = await fetch(`${API_URL}/api/departments/${departmentId}/restore`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
      })
      console.log('Request:', response)
      const responseData = await response.json()
      console.log('Response data:', responseData)
      if (response.ok) {
        if (showDeletedDepartments) {
          await fetchDeletedDepartments()
        } else {
          await fetchDepartments()
        }
        setNotification({ message: "Departamento restaurado exitosamente", type: "success" })
      } else {
        console.error("Error al restaurar departamento:", responseData)
        setNotification({ message: responseData.error || "Error al restaurar departamento", type: "error" })
      }
    } catch (error) {
      console.error("Error al restaurar departamento", error)
      setNotification({ message: "Error al restaurar departamento", type: "error" })
    }
  }

  // Manejar clic en eliminar
  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (departmentToDelete) {
      await deleteDepartment(departmentToDelete.departmentId)
      setIsDeleteDialogOpen(false)
      setDepartmentToDelete(null)
    }
  }

  // Ordenar departamentos
  const requestSort = (key: SortableDepartmentKey) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })

    const sortedDepartments = [...filteredDepartments].sort((a, b) => {
      const aValue = a[key] !== undefined ? a[key] : (typeof a[key] === 'number' ? 0 : '')
      const bValue = b[key] !== undefined ? b[key] : (typeof b[key] === 'number' ? 0 : '')
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1
      return 0
    })

    setFilteredDepartments(sortedDepartments)
  }

  // Cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Paginación
  const paginatedDepartments = filteredDepartments.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Gestión de Departamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Departamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{editingDepartment ? "Editar Departamento" : "Agregar Departamento"}</DialogTitle>
                <DialogDescription>
                  {editingDepartment ? "Actualiza la información del departamento." : "Completa la información para agregar un nuevo departamento."}
                </DialogDescription>
              </DialogHeader>
              <DepartmentForm
                onSubmit={editingDepartment ? updateDepartment : addDepartment}
                initialData={editingDepartment}
                onCancel={() => setIsDialogOpen(false)}
                faculties={faculties}
              />
            </DialogContent>
          </Dialog>

          <Button
            className="text-white"
            onClick={() => setShowDeletedDepartments(!showDeletedDepartments)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showDeletedDepartments ? 'Ver Departamentos Activos' : 'Ver Departamentos Eliminados'}
          </Button>
        </div>

        <AdvancedFilter
          onFilter={handleAdvancedFilter}
          faculties={faculties}
        />

        <div className="rounded-md border mt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('name')}>
                  Nombre
                  {sortConfig?.key === 'name' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('director')}>
                  Director
                  {sortConfig?.key === 'director' && (
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
              {paginatedDepartments.map((department) => (
                <TableRow key={department.departmentId}>
                  <TableCell>{department.name}</TableCell>
                  <TableCell>{department.director}</TableCell>
                  <TableCell>{faculties.find(faculty => faculty.facultyId === department.facultyId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!showDeletedDepartments && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-green-50"
                            onClick={() => {
                              setEditingDepartment(department)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(department)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {showDeletedDepartments && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreDepartment(department.departmentId)}
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
          departmentName={departmentToDelete ? `${departmentToDelete.name}` : ''}
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
