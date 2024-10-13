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
type Program = {
  programId: number
  name: string
  campusId?: number
  director: string
  isDeleted: boolean
}

type ProgramFormData = {
  name: string
  campusId?: number
  director: string
}

type Campus = {
  campusId: number
  name: string
}

type SortableProgramKey = keyof Pick<
  Program,
  'name' | 'director' | 'campusId'
>

// Esquema Zod
const programFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  director: z.string().nonempty("El director es requerido"),
  campusId: z.number().int().positive("Debe seleccionar una sede").optional(),
})

// Componente de diálogo de confirmación de eliminación
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  programName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  programName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la carrera <strong>{programName}</strong>?
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
  campuses
}: {
  onFilter: (filters: any) => void
  campuses: Campus[]
}) {
  const [name, setName] = useState("")
  const [director, setDirector] = useState("")
  const [campusId, setCampusId] = useState("all")

  useEffect(() => {
    onFilter({ name, director, campusId })
  }, [name, director, campusId, onFilter])

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
            <Label htmlFor="campus-filter">Sede</Label>
            <Select value={campusId} onValueChange={setCampusId}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las sedes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sedes</SelectItem>
                {campuses.map((campus) => (
                  <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                    {campus.name}
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

// Componente de formulario de carrera
function ProgramForm({
  onSubmit,
  initialData,
  onCancel,
  campuses
}: {
  onSubmit: (data: ProgramFormData) => Promise<void>
  initialData?: Program | null
  onCancel: () => void
  campuses: Campus[]
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      director: initialData.director,
      campusId: initialData.campusId,
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
        <Label htmlFor="campusId">Sede</Label>
        <Controller
          name="campusId"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
              value={field.value !== undefined ? field.value.toString() : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sede" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.campusId && <p className="text-red-500 text-sm">{errors.campusId.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"} Carrera
        </Button>
      </div>
    </form>
  )
}

// Componente principal de gestión de carreras
export default function ProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: SortableProgramKey;
    direction: 'ascending' | 'descending';
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showDeletedPrograms, setShowDeletedPrograms] = useState(false)

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingProgram(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    fetchCampuses()
    if (showDeletedPrograms) {
      fetchDeletedPrograms()
    } else {
      fetchPrograms()
    }
  }, [showDeletedPrograms])

  // Función para obtener carreras activas
  const fetchPrograms = async () => {
    try {
      console.log('Fetching programs...')
      const response = await fetch(`${API_URL}/api/programs`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Program[] = await response.json()
        console.log('Response data:', data)
        const activePrograms = data.filter(program => !program.isDeleted)
        setPrograms(activePrograms)
        setFilteredPrograms(activePrograms)
        setTotalPages(Math.ceil(activePrograms.length / 10))
      } else {
        const errorData = await response.json()
        console.error("Error al obtener carreras:", errorData)
        setNotification({ message: errorData.error || "Error al obtener carreras", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener carreras", error)
      setNotification({ message: "Error al obtener carreras", type: "error" })
    }
  }

  // Función para obtener carreras eliminadas
  const fetchDeletedPrograms = async () => {
    try {
      console.log('Fetching deleted programs...')
      const response = await fetch(`${API_URL}/api/programs/deleted/history`, {
        credentials: 'include',
      })
      console.log('Request:', response)
      if (response.ok) {
        const data: Program[] = await response.json()
        console.log('Response data:', data)
        setPrograms(data)
        setFilteredPrograms(data)
        setTotalPages(Math.ceil(data.length / 10))
      } else {
        const errorData = await response.json()
        console.error("Error al obtener carreras eliminadas:", errorData)
        setNotification({ message: errorData.error || "Error al obtener carreras eliminadas", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener carreras eliminadas", error)
      setNotification({ message: "Error al obtener carreras eliminadas", type: "error" })
    }
  }

  // Función para obtener sedes
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
        setCampuses(data)
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

  // Función para filtrar carreras
  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = programs.filter(program =>
      (filters.name === "" || program.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.director === "" || program.director.toLowerCase().includes(filters.director.toLowerCase())) &&
      (filters.campusId === "all" || program.campusId?.toString() === filters.campusId)
    )
    setFilteredPrograms(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [programs])

  // Función para agregar una nueva carrera
  const addProgram = async (data: ProgramFormData) => {
    try {
      console.log('Adding program with data:', data)
      const response = await fetch(`${API_URL}/api/programs`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      console.log('Request:', response)
      if (response.ok) {
        await fetchPrograms()
        setIsDialogOpen(false)
        setNotification({ message: "Carrera agregada exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al agregar carrera:", errorData)
        setNotification({ message: errorData.error || "Error al agregar carrera", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar carrera", error)
      setNotification({ message: "Error al agregar carrera", type: "error" })
    }
  }

  // Función para actualizar una carrera existente
  const updateProgram = async (data: ProgramFormData) => {
    if (!editingProgram) return
    try {
      console.log('Updating program with data:', data)
      const response = await fetch(`${API_URL}/api/programs/${editingProgram.programId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })
      console.log('Request:', response)
      if (response.ok) {
        if (showDeletedPrograms) {
          await fetchDeletedPrograms()
        } else {
          await fetchPrograms()
        }
        setEditingProgram(null)
        setIsDialogOpen(false)
        setNotification({ message: "Carrera actualizada exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al actualizar carrera:", errorData)
        setNotification({ message: errorData.error || "Error al actualizar carrera", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar carrera", error)
      setNotification({ message: "Error al actualizar carrera", type: "error" })
    }
  }

  // Función para eliminar una carrera
  const deleteProgram = async (programId: number) => {
    try {
      console.log(`Deleting program with id: ${programId}`)
      const response = await fetch(`${API_URL}/api/programs/${programId}`, {
        method: "DELETE",
        credentials: 'include'
      })
      console.log('Request:', response)
      if (response.ok) {
        if (showDeletedPrograms) {
          await fetchDeletedPrograms()
        } else {
          await fetchPrograms()
        }
        setNotification({ message: "Carrera eliminada exitosamente", type: "success" })
      } else {
        const errorData = await response.json()
        console.error("Error al eliminar carrera:", errorData)
        setNotification({ message: errorData.error || "Error al eliminar carrera", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar carrera", error)
      setNotification({ message: "Error al eliminar carrera", type: "error" })
    }
  }

  // Manejar clic en eliminar
  const handleDeleteClick = (program: Program) => {
    setProgramToDelete(program)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (programToDelete) {
      await deleteProgram(programToDelete.programId)
      setIsDeleteDialogOpen(false)
      setProgramToDelete(null)
    }
  }

  // Ordenar carreras
  const requestSort = (key: SortableProgramKey) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })

    const sortedPrograms = [...filteredPrograms].sort((a, b) => {
      const aValue = a[key] !== undefined ? a[key] : (typeof a[key] === 'number' ? 0 : '')
      const bValue = b[key] !== undefined ? b[key] : (typeof b[key] === 'number' ? 0 : '')
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1
      return 0
    })

    setFilteredPrograms(sortedPrograms)
  }

  // Cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Paginación
  const paginatedPrograms = filteredPrograms.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Gestión de Carreras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Carrera
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{editingProgram ? "Editar Carrera" : "Agregar Carrera"}</DialogTitle>
                <DialogDescription>
                  {editingProgram ? "Actualiza la información de la carrera." : "Completa la información para agregar una nueva carrera."}
                </DialogDescription>
              </DialogHeader>
              <ProgramForm
                onSubmit={editingProgram ? updateProgram : addProgram}
                initialData={editingProgram}
                onCancel={() => setIsDialogOpen(false)}
                campuses={campuses}
              />
            </DialogContent>
          </Dialog>

          <Button
            className="text-white"
            onClick={() => setShowDeletedPrograms(!showDeletedPrograms)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showDeletedPrograms ? 'Ver Carreras Activas' : 'Ver Carreras Eliminadas'}
          </Button>
        </div>

        <AdvancedFilter
          onFilter={handleAdvancedFilter}
          campuses={campuses}
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
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('campusId')}>
                  Sede
                  {sortConfig?.key === 'campusId' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPrograms.map((program) => (
                <TableRow key={program.programId}>
                  <TableCell>{program.name}</TableCell>
                  <TableCell>{program.director}</TableCell>
                  <TableCell>{campuses.find(campus => campus.campusId === program.campusId)?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!showDeletedPrograms && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-green-50"
                            onClick={() => {
                              setEditingProgram(program)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(program)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {showDeletedPrograms && (
                        // Si tienes una ruta para restaurar programas, puedes agregar el botón de restaurar aquí
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreProgram(program.programId)} // Necesitas implementar restoreProgram si la ruta existe
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
          programName={programToDelete ? `${programToDelete.name}` : ''}
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
