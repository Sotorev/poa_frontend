// src/components/poa/sections/resource-management.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Trash2, PlusCircle, Edit, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { z } from 'zod';
import { PoaResource } from '@/types/poaResource.types';
import { createPoaResourceSchema, updatePoaResourceSchema } from '@/schemas/poaResource.schema';

// Definir un tipo para la actualización que no requiere 'poaId'
type UpdatePoaResource = Partial<Omit<PoaResource, 'poaResourceId' | 'isDeleted'>>;

interface ResourceManagementProps {
  name: string;
  isActive?: boolean;
  poaId: number;
  isEditable?: boolean;
}

export function ResourceManagementComponent({ name, isActive, poaId, isEditable = true }: ResourceManagementProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resources, setResources] = useState<PoaResource[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResource, setCurrentResource] = useState<PoaResource | null>(null);
  const { toast } = useToast();

  // Estados para manejar los campos del formulario de manera controlada
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poaId]);

  // Función para obtener todos los recursos asociados al poaId
  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaResources/resources?poaId=${poaId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los recursos.');
      }
      const data: PoaResource[] = await response.json();
   
      setResources(data);
    } catch (error: any) {
      console.error('Error al obtener los recursos:', error); // Depuración
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los recursos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear un nuevo recurso
  const createResource = async (resourceData: Omit<PoaResource, 'poaResourceId' | 'isDeleted'>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaResources/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el recurso.');
      }
      // Asumiendo que la API devuelve el ID del nuevo recurso
      const responseData = await response.json();
      const newResourceId = responseData.poaResourceId;

      if (!newResourceId) {
        throw new Error('No se pudo obtener el ID del nuevo recurso.');
      }

      const newResource: PoaResource = {
        ...resourceData, poaResourceId: newResourceId,
        isDeleted: false
      };

      // Actualizar el estado local agregando el nuevo recurso
      setResources(prev => [...prev, newResource]);

      toast({
        title: "Éxito",
        description: "Recurso agregado correctamente.",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error al crear el recurso:', error); // Depuración
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el recurso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para actualizar un recurso existente
  const updateResource = async (id: number, resourceData: UpdatePoaResource) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaResources/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el recurso.');
      }

      // Como la API no devuelve el recurso actualizado, lo construimos localmente
      const updatedResource: PoaResource = {
        ...resourceData,
        poaResourceId: id,
        isDeleted: false,
        name: resourceData.name || '', // Ensure name is always defined
        amount: resourceData.amount ?? 0, // Ensure amount is always defined
        poaId: poaId, // Ensure poaId is always defined
      };

      // Actualizar el estado local con el recurso actualizado
      setResources(prev => prev.map(r => r.poaResourceId === id ? { ...r, ...updatedResource } : r));

      toast({
        title: "Éxito",
        description: "Recurso actualizado correctamente.",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error al actualizar el recurso:', error); // Depuración
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el recurso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar un recurso
  const deleteResource = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poaResources/resources/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el recurso.');
      }
   
      setResources(prev => prev.filter(r => r.poaResourceId !== id));
      toast({
        title: "Éxito",
        description: "Recurso eliminado correctamente.",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error al eliminar el recurso:', error); // Depuración
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el recurso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para alternar el modo de edición
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Handler para abrir el diálogo de agregar recurso
  const handleAddResource = () => {
    setCurrentResource(null);
    setFormName('');
    setFormAmount('');
    setIsDialogOpen(true);
  };

  // Handler para abrir el diálogo de editar recurso
  const handleEditResource = (resource: PoaResource) => {
    setCurrentResource(resource);
    setFormName(resource.name);
    setFormAmount(resource.amount?.toString() || '');
    setIsDialogOpen(true);
  };

  // Handler para confirmar la creación o actualización de un recurso
  const handleConfirmResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setIsLoading(true); // Mover este setIsLoading dentro de las funciones createResource y updateResource
    try {
      // Construir los datos del formulario
      const name = formName.trim();
      const amount = parseFloat(formAmount);

      // Validar los datos usando Zod
      let validatedData: any;
      if (currentResource) {
        // Actualizar recurso existente
        validatedData = updatePoaResourceSchema.parse({ name, amount });
      } else {
        // Crear nuevo recurso
        validatedData = createPoaResourceSchema.parse({ name, amount, poaId });
      }

      if (currentResource) {
        // Actualizar recurso existente
        await updateResource(currentResource.poaResourceId, validatedData);
      } else {
        // Crear nuevo recurso
        await createResource(validatedData);
      }

      // Cerrar el diálogo y resetear los campos del formulario
      setIsDialogOpen(false);
      setFormName('');
      setFormAmount('');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('Error de validación:', error.errors); // Depuración
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error('Error al confirmar recurso:', error); // Depuración
        toast({
          title: "Error",
          description: "No se pudo guardar el recurso.",
          variant: "destructive",
        });
      }
    }
  };

  // Handler para confirmar la eliminación de un recurso
  const handleRemoveResource = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
      await deleteResource(id);
    }
  };

  return (
    <div id={name} className="mb-6">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300`}>
        {/* Cabecera de la sección */}
        <div className="p-4 bg-green-50 flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-semibold text-primary mb-2 sm:mb-0">Gestión de Recursos</h2>
          <div className="flex items-center space-x-2">
            {isEditable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-primary hover:text-primary hover:bg-green-100"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Finalizar edición" : "Editar"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary hover:text-primary hover:bg-green-100"
            >
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Cuerpo de la sección */}
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="space-y-6">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={handleAddResource}
                  className="bg-green-50 text-primary hover:bg-green-100 hover:text-primary mb-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Agregar Recurso
                </Button>
              )}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-black">Nombre</TableHead>
                      <TableHead className="text-black">Monto</TableHead>
                      {isEditing && <TableHead className="text-black">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.poaResourceId}>
                        <TableCell>{resource.name}</TableCell>
                        <TableCell>Q{resource.amount?.toFixed(2) ?? '0.00'}</TableCell>
                        {isEditing && (
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditResource(resource)}
                                className="text-primary hover:text-primary hover:bg-green-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveResource(resource.poaResourceId)}
                                className="text-primary hover:text-primary hover:bg-green-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {resources.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={isEditing ? 3 : 2} className="text-center">
                          No hay recursos disponibles.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {isLoading && (
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Diálogo para agregar o editar recursos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-green-50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {currentResource ? 'Editar Recurso' : 'Agregar Recurso'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConfirmResource} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-black">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-black">
                Monto
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <Button type="submit" className="bg-primary text-white hover:bg-green-700 w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (currentResource ? "Actualizar" : "Agregar")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
