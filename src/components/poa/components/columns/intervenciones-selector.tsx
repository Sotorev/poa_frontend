// src/components/poa/components/columns/intervenciones-selector.tsx

'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInterventionSchema, CreateInterventionInput } from "@/schemas/interventionSchema";
import { useCurrentUser } from "@/hooks/use-current-user";

interface Intervencion {
  interventionId: number;
  name: string;
  isDeleted: boolean;
  strategyId: number;
  isCustom?: boolean;
}

interface IntervencionesProps {
  selectedIntervenciones: string[];
  onSelectIntervencion: (intervenciones: string[]) => void;
  disabled?: boolean; // Nueva propiedad
  tooltipMessage?: string; // Mensaje del tooltip cuando está deshabilitado
  strategyIds: string[]; // Nueva propiedad para filtrar intervenciones por estrategias seleccionadas
}

export function IntervencionesSelectorComponent({
  selectedIntervenciones,
  onSelectIntervencion,
  disabled = false, // Por defecto, no está deshabilitado
  tooltipMessage = "Por favor, seleccione al menos una estrategia primero.", // Mensaje por defecto
  strategyIds, // Nueva propiedad
}: IntervencionesProps) {
  const [intervencionesList, setIntervencionesList] = useState<Intervencion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newIntervencionInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInterventionInput>({
    resolver: zodResolver(createInterventionSchema),
    defaultValues: {
      name: "",
      strategyId: 0,
    },
  });

  useEffect(() => {
    const fetchIntervenciones = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error al obtener intervenciones: ${response.statusText}`);
        }
        const data: Intervencion[] = await response.json();
        // Filtrar intervenciones que no estén eliminadas y que pertenezcan a las estrategias seleccionadas
        const strategyIdsNum = strategyIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
        const filteredIntervenciones = data.filter(
          (intervencion) => !intervencion.isDeleted && strategyIdsNum.includes(intervencion.strategyId)
        );
        setIntervencionesList(filteredIntervenciones);
      } catch (error) {
        console.error("Error al obtener intervenciones:", error);
      }
    };

    if (!disabled && strategyIds.length > 0) { // Solo fetch si no está deshabilitado y hay estrategias seleccionadas
      fetchIntervenciones();
    } else {
      setIntervencionesList([]); // Limpiar la lista si está deshabilitado o no hay estrategias
    }
  }, [disabled, user?.token, strategyIds]);

  const filteredIntervenciones = useMemo(() => {
    return intervencionesList.filter((int) =>
      int.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [intervencionesList, searchTerm]);

  const handleSelectIntervencion = (intervencionId: string) => {
    if (disabled) return; // No permitir cambios si está deshabilitado
    const updatedIntervenciones = selectedIntervenciones.includes(intervencionId)
      ? selectedIntervenciones.filter((id) => id !== intervencionId)
      : [...selectedIntervenciones, intervencionId];
    onSelectIntervencion(updatedIntervenciones);
  };

  const handleRemoveIntervencion = (intId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return; // No permitir cambios si está deshabilitado
    const updatedIntervenciones = selectedIntervenciones.filter(id => id !== intId);
    onSelectIntervencion(updatedIntervenciones);
  };

  const onSubmit = async (data: CreateInterventionInput) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la intervención");
      }

      const createdIntervencion: Intervencion = await response.json();
      const newIntervencion: Intervencion = { ...createdIntervencion, isCustom: true };
      setIntervencionesList((prev) => [...prev, newIntervencion]);
      onSelectIntervencion([...selectedIntervenciones, newIntervencion.interventionId.toString()]);
      reset();
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error al agregar nueva intervención:", error);
    }
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAddingNew && newIntervencionInputRef.current) {
      newIntervencionInputRef.current.focus();
    }
  }, [isAddingNew]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedIntervenciones.map((id) => {
                  const intervencion = intervencionesList.find(
                    (int) => int.interventionId.toString() === id
                  );
                  if (!intervencion) return null;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className={`bg-green-100 text-green-800 flex items-center ${
                        disabled ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {intervencion.isCustom ? `E${intervencion.interventionId}` : intervencion.interventionId}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                        onClick={(event) => handleRemoveIntervencion(id, event)}
                        aria-label={`Eliminar ${intervencion.name}`}
                        disabled={disabled} // Deshabilitar el botón si está deshabilitado
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>

              <Select
                open={isOpen}
                onOpenChange={setIsOpen}
                onValueChange={handleSelectIntervencion}
                disabled={disabled} // Deshabilitar el Select si está deshabilitado
              >
                <SelectTrigger className="w-[300px] border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <SelectValue placeholder="Selecciona intervenciones" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar intervención..."
                      className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-green-500 border-green-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={disabled} // Deshabilitar el input si está deshabilitado
                    />
                  </div>
                  <ScrollArea className="h-[200px]">
                    <SelectGroup>
                      {filteredIntervenciones.map((int) => (
                        <SelectItem
                          key={int.interventionId}
                          value={int.interventionId.toString()}
                          className="focus:bg-green-100 focus:text-green-800 hover:bg-green-50"
                        >
                          <div className="flex items-center">
                            <Checkbox
                              checked={selectedIntervenciones.includes(int.interventionId.toString())}
                              onCheckedChange={() => handleSelectIntervencion(int.interventionId.toString())}
                              className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                              disabled={disabled} // Deshabilitar el checkbox si está deshabilitado
                            />
                            <div
                              className={`w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold ${
                                int.isCustom ? "bg-blue-500" : "bg-green-500"
                              }`}
                            >
                              {int.isCustom ? `E${int.interventionId}` : int.interventionId}
                            </div>
                            {int.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TooltipTrigger>
        {disabled && (
          <TooltipContent>
            <p>{tooltipMessage}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
