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
import { useCurrentUser } from "@/hooks/use-current-user"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Tipos
type Faculty = {
  facultyId: number
  name: string
  deanName: string
  additionalInfo: string
  // currentStudentCount: number
  annualBudget: number
  isDeleted: boolean
}

type FacultyFormData = {
  name: string
  deanName: string
  additionalInfo: string
  // currentStudentCount: number
  annualBudget: number
}

type SortableFacultyKey = keyof Pick<Faculty, 'name' | 'deanName' | 'additionalInfo' | 'annualBudget'>

// Esquema Zod
const facultyFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  deanName: z.string().nonempty("El nombre del decano es requerido"),
  additionalInfo: z.string().nonempty("La información adicional es requerida"),
  // currentStudentCount: z.number().int().nonnegative("La cantidad de estudiantes debe ser un número positivo"),
  annualBudget: z.number().nonnegative("El presupuesto anual debe ser un número positivo"),
})

// Componente de diálogo de confirmación de eliminación
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  facultyName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  facultyName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la Facultad <strong>{facultyName}</strong>?
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
  onFilter
}: {
  onFilter: (filters: any) => void
}) {
  const [name, setName] = useState("")
  const [deanName, setDeanName] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")

  useEffect(() => {
    onFilter({ name, deanName, additionalInfo })
  }, [name, deanName, additionalInfo, onFilter])

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <Label htmlFor="deanName-filter">Nombre del Decano</Label>
            <Input
              id="deanName-filter"
              value={deanName}
              onChange={(e) => setDeanName(e.target.value)}
              placeholder="Filtrar por nombre del decano"
            />
          </div>
          <div>
            <Label htmlFor="additionalInfo-filter">Información Adicional</Label>
            <Input
              id="additionalInfo-filter"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Filtrar por información adicional"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de formulario de Facultad
function FacultyForm({
  onSubmit,
  initialData,
  onCancel
}: {
  onSubmit: (data: FacultyFormData) => Promise<void>
  initialData?: Faculty | null
  onCancel: () => void
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FacultyFormData>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      deanName: initialData.deanName,
      additionalInfo: initialData.additionalInfo,
      // currentStudentCount: initialData.currentStudentCount,
      annualBudget: initialData.annualBudget,
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
        <Label htmlFor="deanName">Nombre del Decano</Label>
        <Input id="deanName" {...register("deanName")} />
        {errors.deanName && <p className="text-red-500 text-sm">{errors.deanName.message}</p>}
      </div>
      <div>
        <Label htmlFor="additionalInfo">Información Adicional</Label>
        <Input id="additionalInfo" {...register("additionalInfo")} />
        {errors.additionalInfo && <p className="text-red-500 text-sm">{errors.additionalInfo.message}</p>}
      </div>
      {/* <div>
        <Label htmlFor="currentStudentCount">Cantidad Actual de Estudiantes</Label>
        <Input
          id="currentStudentCount"
          type="number"
          {...register("currentStudentCount", { valueAsNumber: true })}
        />
        {errors.currentStudentCount && <p className="text-red-500 text-sm">{errors.currentStudentCount.message}</p>}
      </div> */}
      <div>
        <Label htmlFor="annualBudget">Presupuesto Anual</Label>
        <Input
          id="annualBudget"
          type="number"
          step="0.01"
          {...register("annualBudget", { valueAsNumber: true })}
        />
        {errors.annualBudget && <p className="text-red-500 text-sm">{errors.annualBudget.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"} Facultad
        </Button>
      </div>
    </form>
  )
}

// Componente principal de gestión de Facultades
export default function FacultyManagement() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([])
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFacultyKey;
    direction: 'ascending' | 'descending';
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showDeletedFaculties, setShowDeletedFaculties] = useState(false)
  const user = useCurrentUser();

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingFaculty(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    if (showDeletedFaculties) {
      fetchDeletedFaculties()
    } else {
      fetchFaculties()
    }
  }, [showDeletedFaculties])

  // Función para obtener Facultades activas
  const fetchFaculties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faculties`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
      })
      if (response.ok) {
        const data: Faculty[] = await response.json()
        const activeFaculties = data.filter(faculty => !faculty.isDeleted)
        setFaculties(activeFaculties)
        setFilteredFaculties(activeFaculties)
        setTotalPages(Math.ceil(activeFaculties.length / 10))
      } else {
        const errorData = await response.json();
        console.error("Error al obtener Facultades:", errorData);
        setNotification({ message: errorData.error || "Error al obtener Facultades", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener Facultades", error)
      setNotification({ message: "Error al obtener Facultades", type: "error" })
    }
  }

  // Función para obtener Facultades eliminadas
  const fetchDeletedFaculties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faculties/deleted/history`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },      })
      if (response.ok) {
        const data: Faculty[] = await response.json()
        setFaculties(data)
        setFilteredFaculties(data)
        setTotalPages(Math.ceil(data.length / 10))
      } else {
        const errorData = await response.json();
        console.error('Error al obtener Facultades eliminadas:', errorData);
        setNotification({ message: errorData.error || 'Error al obtener Facultades eliminadas', type: 'error' })
      }
    } catch (error) {
      console.error('Error al obtener Facultades eliminadas', error)
      setNotification({ message: 'Error al obtener Facultades eliminadas', type: 'error' })
    }
  }

  // Función para filtrar Facultades
  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = faculties.filter(item =>
      (filters.name === "" || item.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.deanName === "" || item.deanName.toLowerCase().includes(filters.deanName.toLowerCase())) &&
      (filters.additionalInfo === "" || item.additionalInfo.toLowerCase().includes(filters.additionalInfo.toLowerCase()))
    )
    setFilteredFaculties(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [faculties])

  // Función para agregar una nueva Facultad
  const addFaculty = async (data: FacultyFormData) => {
    try {
      const response = await fetch(`${API_URL}/api/faculties`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchFaculties()
        setIsDialogOpen(false)
        setNotification({ message: "Facultad agregada exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al agregar Facultad:", errorData);
        setNotification({ message: errorData.error || "Error al agregar Facultad", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar Facultad", error)
      setNotification({ message: "Error al agregar Facultad", type: "error" })
    }
  }

  // Función para actualizar una Facultad existente
  const updateFaculty = async (data: FacultyFormData) => {
    if (!editingFaculty) return
    try {
      const response = await fetch(`${API_URL}/api/faculties/${editingFaculty.facultyId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        if (showDeletedFaculties) {
          await fetchDeletedFaculties()
        } else {
          await fetchFaculties()
        }
        setEditingFaculty(null)
        setIsDialogOpen(false)
        setNotification({ message: "Facultad actualizada exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar Facultad:", errorData);
        setNotification({ message: errorData.error || "Error al actualizar Facultad", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar Facultad", error)
      setNotification({ message: "Error al actualizar Facultad", type: "error" })
    }
  }

  // Función para eliminar una Facultad
  const deleteFaculty = async (facultyId: number) => {
    try {
      const response  = await fetch(`${API_URL}/api/faculties/${facultyId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },      })
      if (response.ok) {
        if (showDeletedFaculties) {
          await fetchDeletedFaculties()
        } else {
          await fetchFaculties()
        }
        setNotification({ message: "Facultad eliminada exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar Facultad:", errorData);
        setNotification({ message: errorData.error || "Error al eliminar Facultad", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar Facultad", error)
      setNotification({ message: "Error al eliminar Facultad", type: "error" })
    }
  }

  // Función para restaurar una Facultad eliminada
  const restoreFaculty = async (facultyId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/faculties/${facultyId}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },        
      });

      let responseData = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();

      }

      if (response.ok) {
        if (showDeletedFaculties) {
          await fetchDeletedFaculties();
        } else {
          await fetchFaculties();
        }
        setNotification({ message: "Facultad restaurada exitosamente", type: "success" });
      } else {
        console.error("Error al restaurar Facultad:", responseData);
        setNotification({ message: responseData?.error || "Error al restaurar Facultad", type: "error" });
      }
    } catch (error) {
      console.error("Error al restaurar Facultad:", error);
      setNotification({ message: "Error al restaurar Facultad", type: "error" });
    }
  }

  // Manejar clic en eliminar
  const handleDeleteClick = (item: Faculty) => {
    setFacultyToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (facultyToDelete) {
      await deleteFaculty(facultyToDelete.facultyId)
      setIsDeleteDialogOpen(false)
      setFacultyToDelete(null)
    }
  }

  // Ordenar Facultades
  const requestSort = (key: SortableFacultyKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedFaculties = [...filteredFaculties].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';

      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredFaculties(sortedFaculties);
  };

  // Cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Paginación
  const paginatedFaculties = filteredFaculties.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Gestión de Facultades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Facultad
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{editingFaculty ? "Editar Facultad" : "Agregar Facultad"}</DialogTitle>
                <DialogDescription>
                  {editingFaculty ? "Actualiza la información de la Facultad." : "Completa la información para agregar una nueva Facultad."}
                </DialogDescription>
              </DialogHeader>
              <FacultyForm
                onSubmit={editingFaculty ? updateFaculty : addFaculty}
                initialData={editingFaculty}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            className="text-white"
            onClick={() => setShowDeletedFaculties(!showDeletedFaculties)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showDeletedFaculties ? 'Ver Facultades Activas' : 'Ver Facultades Eliminadas'}
          </Button>
        </div>

        <AdvancedFilter
          onFilter={handleAdvancedFilter}
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
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('deanName')}>
                  Nombre del Decano
                  {sortConfig?.key === 'deanName' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('additionalInfo')}>
                  Información Adicional
                  {sortConfig?.key === 'additionalInfo' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                {/* <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('currentStudentCount')}>
                  Estudiantes Actuales
                  {sortConfig?.key === 'currentStudentCount' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead> */}
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('annualBudget')}>
                  Presupuesto Anual
                  {sortConfig?.key === 'annualBudget' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFaculties.map((item) => (
                <TableRow key={item.facultyId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.deanName}</TableCell>
                  <TableCell>{item.additionalInfo}</TableCell>
                  {/* <TableCell>{item.currentStudentCount}</TableCell> */}
                  <TableCell>{item.annualBudget.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!showDeletedFaculties && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-green-50"
                            onClick={() => {
                              setEditingFaculty(item)
                              setIsDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {showDeletedFaculties && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreFaculty(item.facultyId)}
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
          facultyName={facultyToDelete ? `${facultyToDelete.name}` : ''}
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