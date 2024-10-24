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
}

export function IntervencionesSelectorComponent({ selectedIntervenciones, onSelectIntervencion }: IntervencionesProps) {
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
        const filteredIntervenciones = data.filter(
          (intervencion) => !intervencion.isDeleted
        );
        setIntervencionesList(filteredIntervenciones);
      } catch (error) {
        console.error("Error al obtener intervenciones:", error);
      }
    };

    fetchIntervenciones();
  }, []);

  const filteredIntervenciones = useMemo(() => {
    return intervencionesList.filter((int) =>
      int.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [intervencionesList, searchTerm]);

  const handleSelectIntervencion = (intervencionId: string) => {
    if (!intervencionId) return;
    const updatedIntervenciones = selectedIntervenciones.includes(intervencionId)
      ? selectedIntervenciones.filter((id) => id !== intervencionId)
      : [...selectedIntervenciones, intervencionId];
    onSelectIntervencion(updatedIntervenciones);
  };

  const handleRemoveIntervencion = (intId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIntervenciones.map((id) => {
          const intervencion = intervencionesList.find(
            (int) => int.interventionId.toString() === id
          );
          if (!intervencion) return null;
          return (
            <TooltipProvider key={id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {intervencion.isCustom ? `E${intervencion.interventionId}` : intervencion.interventionId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                      onClick={(event) => handleRemoveIntervencion(id, event)}
                      aria-label={`Eliminar ${intervencion.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{intervencion.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <Select
        open={isOpen}
        onOpenChange={setIsOpen}
        onValueChange={handleSelectIntervencion}
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
                    />
                    <div
                      className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold bg-green-500"
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

      {/* Commenting out the add new intervention functionality */}
      {/* <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
            <Input
              placeholder="Nueva intervención..."
              {...register("name")}
              className={`h-8 w-[240px] border ${
                errors.name ? "border-red-500" : "border-green-300"
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100 border-green-300 hover:border-green-500"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                reset();
              }}
              size="sm"
              variant="outline"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-300 hover:border-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="outline"
            className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 border-green-300 hover:border-green-500"
          >
            <Plus className="h-3 w-3 mr-1" />
            Proponer nueva intervención
          </Button>
        )}
      </div> */}

      {/* Removing error message display */}
      {/* {errors.name && (
        <span className="text-red-500 text-sm">{errors.name.message}</span>
      )} */}
    </div>
  );
}