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
type Ods = {
  odsId: number
  name: string
  description: string
  isDeleted: boolean
}

type OdsFormData = {
  name: string
  description: string
}

type SortableOdsKey = keyof Pick<Ods, 'name' | 'description'>

// Esquema Zod
const odsFormSchema = z.object({
  name: z.string().nonempty("El nombre es requerido"),
  description: z.string().nonempty("La descripción es requerida"),
})

// Componente de diálogo de confirmación de eliminación
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  odsName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  odsName: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el ODS <strong>{odsName}</strong>?
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
  const [description, setDescription] = useState("")

  useEffect(() => {
    onFilter({ name, description })
  }, [name, description, onFilter])

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
            <Label htmlFor="description-filter">Descripción</Label>
            <Input
              id="description-filter"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Filtrar por descripción"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de formulario de ODS
function OdsForm({
  onSubmit,
  initialData,
  onCancel
}: {
  onSubmit: (data: OdsFormData) => Promise<void>
  initialData?: Ods | null
  onCancel: () => void
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<OdsFormData>({
    resolver: zodResolver(odsFormSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description
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
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" {...register("description")} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit">
          {initialData ? "Actualizar" : "Crear"} ODS
        </Button>
      </div>
    </form>
  )
}

// Componente principal de gestión de ODS
export default function OdsManagement() {
  const [ods, setOds] = useState<Ods[]>([])
  const [filteredOds, setFilteredOds] = useState<Ods[]>([])
  const [editingOds, setEditingOds] = useState<Ods | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: SortableOdsKey;
    direction: 'ascending' | 'descending';
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [odsToDelete, setOdsToDelete] = useState<Ods | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showDeletedOds, setShowDeletedOds] = useState(false);
  const user = useCurrentUser();
  
  useEffect(() => {
    if (!isDialogOpen) {
      setEditingOds(null)
    }
  }, [isDialogOpen])

  useEffect(() => {
    if (showDeletedOds) {
      fetchDeletedOds()
    } else {
      fetchOds()
    }
  }, [showDeletedOds])

  // Función para obtener ODS activos
  const fetchOds = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ods`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },      })
      if (response.ok) {
        const data: Ods[] = await response.json()
        const activeOds = data.filter(item => !item.isDeleted)
        setOds(activeOds)
        setFilteredOds(activeOds)
        setTotalPages(Math.ceil(activeOds.length / 10))
      } else {
        const errorData = await response.json();
        console.error("Error al obtener ODS:", errorData);
        setNotification({ message: errorData.error || "Error al obtener ODS", type: "error" })
      }
    } catch (error) {
      console.error("Error al obtener ODS", error)
      setNotification({ message: "Error al obtener ODS", type: "error" })
    }
  }

  // Función para obtener ODS eliminados
  const fetchDeletedOds = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ods/deleted/history`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },      })
      if (response.ok) {
        const data: Ods[] = await response.json()
        setOds(data)
        setFilteredOds(data)
        setTotalPages(Math.ceil(data.length / 10))
      } else {
        const errorData = await response.json();
        console.error('Error al obtener ODS eliminados:', errorData);
        setNotification({ message: errorData.error || 'Error al obtener ODS eliminados', type: 'error' })
      }
    } catch (error) {
      console.error('Error al obtener ODS eliminados', error)
      setNotification({ message: 'Error al obtener ODS eliminados', type: 'error' })
    }
  }

  // Función para filtrar ODS
  const handleAdvancedFilter = useCallback((filters: any) => {
    const filtered = ods.filter(item =>
      (filters.name === "" || item.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.description === "" || item.description.toLowerCase().includes(filters.description.toLowerCase()))
    )
    setFilteredOds(filtered)
    setTotalPages(Math.ceil(filtered.length / 10))
    setCurrentPage(1)
  }, [ods])

  // Función para agregar un nuevo ODS
  const addOds = async (data: OdsFormData) => {
    try {
      const response = await fetch(`${API_URL}/api/ods`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        await fetchOds()
        setIsDialogOpen(false)
        setNotification({ message: "ODS agregado exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al agregar ODS:", errorData);
        setNotification({ message: errorData.error || "Error al agregar ODS", type: "error" })
      }
    } catch (error) {
      console.error("Error al agregar ODS", error)
      setNotification({ message: "Error al agregar ODS", type: "error" })
    }
  }

  // Función para actualizar un ODS existente
  const updateOds = async (data: OdsFormData) => {
    if (!editingOds) return
    try {
      const response = await fetch(`${API_URL}/api/ods/${editingOds.odsId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        if (showDeletedOds) {
          await fetchDeletedOds()
        } else {
          await fetchOds()
        }
        setEditingOds(null)
        setIsDialogOpen(false)
        setNotification({ message: "ODS actualizado exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar ODS:", errorData);
        setNotification({ message: errorData.error || "Error al actualizar ODS", type: "error" })
      }
    } catch (error) {
      console.error("Error al actualizar ODS", error)
      setNotification({ message: "Error al actualizar ODS", type: "error" })
    }
  }

  // Función para eliminar un ODS
  const deleteOds = async (odsId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/ods/${odsId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },      })
      if (response.ok) {
        if (showDeletedOds) {
          await fetchDeletedOds()
        } else {
          await fetchOds()
        }
        setNotification({ message: "ODS eliminado exitosamente", type: "success" })
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar ODS:", errorData);
        setNotification({ message: errorData.error || "Error al eliminar ODS", type: "error" })
      }
    } catch (error) {
      console.error("Error al eliminar ODS", error)
      setNotification({ message: "Error al eliminar ODS", type: "error" })
    }
  }

  // Función para restaurar un ODS eliminado
  const restoreOds = async (odsId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/ods/${odsId}/restore`, {
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
        if (showDeletedOds) {
          await fetchDeletedOds();
        } else {
          await fetchOds();
        }
        setNotification({ message: "ODS restaurado exitosamente", type: "success" });
      } else {
        console.error("Error al restaurar ODS:", responseData);
        setNotification({ message: responseData?.error || "Error al restaurar ODS", type: "error" });
      }
    } catch (error) {
      console.error("Error al restaurar ODS:", error);
      setNotification({ message: "Error al restaurar ODS", type: "error" });
    }
  }

  // Manejar clic en eliminar
  const handleDeleteClick = (item: Ods) => {
    setOdsToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (odsToDelete) {
      await deleteOds(odsToDelete.odsId)
      setIsDeleteDialogOpen(false)
      setOdsToDelete(null)
    }
  }

  // Ordenar ODS
  const requestSort = (key: SortableOdsKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedOds = [...filteredOds].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';

      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredOds(sortedOds);
  };

  // Cerrar notificación
  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Paginación
  const paginatedOds = filteredOds.slice((currentPage - 1) * 10, currentPage * 10)

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-800">Gestión de ODS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar ODS
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>{editingOds ? "Editar ODS" : "Agregar ODS"}</DialogTitle>
                <DialogDescription>
                  {editingOds ? "Actualiza la información del ODS." : "Completa la información para agregar un nuevo ODS."}
                </DialogDescription>
              </DialogHeader>
              <OdsForm
                onSubmit={editingOds ? updateOds : addOds}
                initialData={editingOds}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            className="text-white"
            onClick={() => setShowDeletedOds(!showDeletedOds)}
          >
            <Users className="mr-2 h-4 w-4" />
            {showDeletedOds ? 'Ver ODS Activos' : 'Ver ODS Eliminados'}
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
                <TableHead className="font-semibold cursor-pointer" onClick={() => requestSort('description')}>
                  Descripción
                  {sortConfig?.key === 'description' && (
                    sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                  )}
                </TableHead>
                <TableHead className="font-semibold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOds.map((item) => (
                <TableRow key={item.odsId}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!showDeletedOds && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-green-50"
                            onClick={() => {
                              setEditingOds(item)
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
                      {showDeletedOds && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreOds(item.odsId)}
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
          odsName={odsToDelete ? `${odsToDelete.name}` : ''}
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
