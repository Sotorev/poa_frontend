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
type Campus = {
  campusId: number
  name: string
  city: string
  department: string
  isDeleted: boolean
  facultyId?: number
  currentStudentCount?: number
}

type CampusFormData = {
  name: string
  city: string
  department: string
  facultyId?: number
  currentStudentCount?: number
}

type Faculty = {
  facultyId: number
  name: string
}

type SortableCampusKey = keyof Pick<
  Campus,
  'name' | 'city' | 'department' | 'facultyId' | 'currentStudentCount'
>

// Esquema Zod
const campusFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  city: z.string().nonempty("La ciudad es requerida"),
  department: z.string().nonempty("El departamento es requerido"),
  facultyId: z.number().int().positive("Debe seleccionar una facultad").optional(),
  currentStudentCount: z.number().int().min(0, "Debe ser un número positivo").optional(),
})

// Componente de diálogo de confirmación de eliminación
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  campusName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  campusName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la sede <strong>{campusName}</strong>?
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
  const [city, setCity] = useState("")
  const [department, setDepartment] = useState("")
  const [facultyId, setFacultyId] = useState("all")

  useEffect(() => {
    onFilter({ name, city, department, facultyId })
  }, [name, city, department, facultyId, onFilter])

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
            <Label htmlFor="city-filter">Ciudad</Label>
            <Input
              id="city-filter"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filtrar por ciudad"
            />
          </div>
          <div>
            <Label htmlFor="department-filter">Departamento</Label>
            <Input
              id="department-filter"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Filtrar por departamento"
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

// Componente de formulario de sede
function CampusForm({
  onSubmit,
  initialData,
  onCancel,
  faculties
}: {
  onSubmit: (data: CampusFormData) => Promise<void>
  initialData?: Campus | null
  onCancel: () => void
  faculties: Faculty[]
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CampusFormData>({
    resolver: zodResolver(campusFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      city: initialData.city,
      department: initialData.department,
      facultyId: initialData.facultyId,
      currentStudentCount: initialData.currentStudentCount
    } : {}
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="department">Departamento</Label>
          <Input id="department" {...register("department")} />
          {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="currentStudentCount">Cantidad de estudiantes actuales</Label>
        <Input id="currentStudentCount" type="number" {...register("currentStudentCount", { valueAsNumber: true })} />
        {errors.currentStudentCount && <p className="text-red-500 text-sm">{errors.currentStudentCount.message}</p>}
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
          {initialData ? "Actualizar" : "Crear"} Sede
        </Button>
      </div>
    </form>
  )
}

// Componente principal de gestión de sedes
export default function CampusManagement() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [filteredCampuses, setFilteredCampuses] = useState<Campus[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: SortableCampusKey;
    direction: 'ascending' | 'descending';
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [campusToDelete, setCampusToDelete] = useState<Campus | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showDeletedCampuses, setShowDeletedCampuses] = useState(false)

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingCampus(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    fetchFaculties()
    if (showDeletedCampuses) {
      fetchDeletedCampuses()
    } else {
      fetchCampuses()
    }
  }, [showDeletedCampuses])

  // Función para obtener sedes activas
  const fetchCampuses = async () => {
    try {
      console.log('Fetching campuses...')
      const response = await fetch(`${API_URL}/api/campus`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Campus[] = await response.json()
        console.log('Response data:', data)
        const activeCampuses = data.filter(campus => !campus.isDeleted)
        setCampuses(activeCampuses)
        setFilteredCampuses(activeCampuses)
        setTotalPages(Math.ceil(activeCampuses.length / 10))
      } else {
        const errorData = await response.json()
        console.error("Error al obtener sedes:", errorData)
        setNotification({ message: errorData.error || "Error al obtener sedes", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener sedes", error)
      setNotification({ message: "Error al obtener sedes", type: "error" })
    }
  }

  // Función para obtener sedes eliminadas
  const fetchDeletedCampuses = async () => {
    try {
      console.log('Fetching deleted campuses...')
      const response = await fetch(`${API_URL}/api/campus/deleted/history`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Campus[] = await response.json()
        console.log('Response data:', data)
        setCampuses(data)
        setFilteredCampuses(data)
        setTotalPages(Math.ceil(data.length / 10))
      } else {
        const errorData = await response.json()
        console.error("Error al obtener sedes eliminadas:", errorData)
        setNotification({ message: errorData.error || "Error al obtener sedes eliminadas", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener sedes eliminadas", error)
      setNotification({ message: "Error al obtener sedes eliminadas", type: "error" })
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

  // Función para filtrar sedes
  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = campuses.filter(campus =>
      (filters.name === "" || campus.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.city === "" || campus.city.toLowerCase().includes(filters.city.toLowerCase())) &&
      (filters.department === "" || campus.department.toLowerCase().includes(filters.department.toLowerCase())) &&
      (filters.facultyId === "all" || campus.facultyId?.toString() === filters.facultyId)
    )
    setFilteredCampuses(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [campuses])

  // Función para agregar una nueva sede
  const addCampus = async (data: CampusFormData) => {
    try {
      console.log('Adding campus with data:', data)
      const response = await fetch(`${API_URL}/api/campus`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      console.log('Request:', response)
      if (response.ok) {
        await fetchCampuses()
        setIsDialogOpen(false)
        setNotification({ message: "Sede agregada exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al agregar sede:", errorData)
        setNotification({ message: errorData.error || "Error al agregar sede", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar sede", error)
      setNotification({ message: "Error al agregar sede", type: "error" })
    }
  }

  // Función para actualizar una sede existente
  const updateCampus = async (data: CampusFormData) => {
    if (!editingCampus) return
    try {
      console.log('Updating campus with data:', data)
      const response = await fetch(`${API_URL}/api/campus/${editingCampus.campusId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      console.log('Request:', response)
      if (response.ok) {
        if (showDeletedCampuses) {
          await fetchDeletedCampuses()
        } else {
          await fetchCampuses()
        }
        setEditingCampus(null)
        setIsDialogOpen(false)
        setNotification({ message: "Sede actualizada exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al actualizar sede:", errorData)
        setNotification({ message: errorData.error || "Error al actualizar sede", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar sede", error)
      setNotification({ message: "Error al actualizar sede", type: "error" })
    }
  }

  // Función para eliminar una sede
  const deleteCampus = async (campusId: number) => {
    try {
      console.log(`Deleting campus with id: ${campusId}`)
      const response = await fetch(`${API_URL}/api/campus/${campusId}`, {
        method: "DELETE",
        credentials: 'include'
      })
      console.log('Request:', response)
      if (response.ok) {
        if (showDeletedCampuses) {
          await fetchDeletedCampuses()
        } else {
          await fetchCampuses()
        }
        setNotification({ message: "Sede eliminada exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al eliminar sede:", errorData)
        setNotification({ message: errorData.error || "Error al eliminar sede", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar sede", error)
      setNotification({ message: "Error al eliminar sede", type: "error" })
    }
  }

  // Función para restaurar una sede eliminada
  const restoreCampus = async (campusId: number) => {
    try {
      console.log(`Restoring campus with id: ${campusId}`)
      const response = await fetch(`${API_URL}/api/campus/restore/${campusId}`, {
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
        if (showDeletedCampuses) {
          await fetchDeletedCampuses()
        } else {
          await fetchCampuses()
        }
        setNotification({ message: "Sede restaurada exitosamente", type: "success" })
      } else {
        console.error("Error al restaurar sede:", responseData)
        setNotification({ message: responseData.error || "Error al restaurar sede", type: "error" })
      }
    } catch (error) {
      console.error("Error al restaurar sede", error)
      setNotification({ message: "Error al restaurar sede", type: "error" })
    }
  }

  // Manejar clic en eliminar
  const handleDeleteClick = (campus: Campus) => {
    setCampusToDelete(campus)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (campusToDelete) {
      await deleteCampus(campusToDelete.campusId)
      setIsDeleteDialogOpen(false)
      setCampusToDelete(null)
    }
  }

  // Ordenar sedes
  const requestSort = (key: SortableCampusKey) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })

    const sortedCampuses = [...filteredCampuses].sort((a, b) => {
      const aValue = a[key] !== undefined ? a[key] : (typeof a[key] === 'number' ? 0 : '')
      const bValue = b[key] !== undefined ? b[key] : (typeof b[key] === 'number' ? 0 : '')
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1
      return 0
    })

    setFilteredCampuses(sortedCampuses)
  }

  // Cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Paginación
  const paginatedCampuses = filteredCampuses.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Gestión de Sedes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Sede
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{editingCampus ? "Editar Sede" : "Agregar Sede"}</DialogTitle>
                <DialogDescription>
                  {editingCampus ? "Actualiza la información de la sede." : "Completa la información para agregar una nueva sede."}
                </DialogDescription>
              </DialogHeader>
              <CampusForm
                onSubmit={editingCampus ? updateCampus : addCampus}
                initialData={editingCampus}
                onCancel={() => setIsDialogOpen(false)}
                faculties={faculties}
              />
            </DialogContent>
          </Dialog>

          <Button
            className="text-white"
            onClick={() => setShowDeletedCampuses(!showDeletedCampuses)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showDeletedCampuses ? 'Ver Sedes Activas' : 'Ver Sedes Eliminadas'}
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
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('city')}>
                  Ciudad
                  {sortConfig?.key === 'city' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('department')}>
                  Departamento
                  {sortConfig?.key === 'department' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('facultyId')}>
                  Facultad
                  {sortConfig?.key === 'facultyId' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('currentStudentCount')}>
                  Estudiantes Actuales
                  {sortConfig?.key === 'currentStudentCount' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCampuses.map((campus) => (
                <TableRow key={campus.campusId}>
                  <TableCell>{campus.name}</TableCell>
                  <TableCell>{campus.city}</TableCell>
                  <TableCell>{campus.department}</TableCell>
                  <TableCell>{faculties.find(faculty => faculty.facultyId === campus.facultyId)?.name || 'N/A'}</TableCell>
                  <TableCell>{campus.currentStudentCount || '0'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!showDeletedCampuses && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-green-50"
                            onClick={() => {
                              setEditingCampus(campus)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(campus)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {showDeletedCampuses && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreCampus(campus.campusId)}
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
          campusName={campusToDelete ? `${campusToDelete.name}` : ''}
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
