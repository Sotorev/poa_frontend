// src/components/poa/components/columns/estrategias-selector.tsx
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStrategySchema, CreateStrategyInput } from "@/schemas/strategySchema";
import { z } from "zod";

// Definir el tipo Estrategia según el backend
interface Estrategia {
  strategyId: number;
  description: string;
  strategicObjectiveId: number;
  completionPercentage: number;
  assignedBudget: number;
  executedBudget: number;
  isDeleted: boolean;
  isCustom?: boolean; // Añadido
}

interface EstrategiasSelectorProps {
  selectedEstrategias: string[];
  onSelectEstrategia: (estrategias: string[]) => void;
  strategicObjectiveId: number; // ID del objetivo estratégico asociado
}

export function EstrategiasSelectorComponent({
  selectedEstrategias,
  onSelectEstrategia,
  strategicObjectiveId,
}: EstrategiasSelectorProps) {
  const [estrategiasList, setEstrategiasList] = useState<Estrategia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newEstrategiaInputRef = useRef<HTMLInputElement>(null);

  // Formulario para agregar nueva estrategia
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStrategyInput>({
    resolver: zodResolver(createStrategySchema),
    defaultValues: {
      description: "",
      strategicObjectiveId: strategicObjectiveId,
    },
  });

  // Fetch de estrategias desde el backend al montar el componente
  useEffect(() => {
    const fetchEstrategias = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategies`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Error al fetch estrategias: ${response.statusText}`);
        }
        const data: Estrategia[] = await response.json();
        // Filtrar estrategias no eliminadas y relacionadas con el strategicObjectiveId
        const filteredEstrategias = data.filter(
          (estrategia) =>
            !estrategia.isDeleted && estrategia.strategicObjectiveId === strategicObjectiveId
        );
        setEstrategiasList(filteredEstrategias);
      } catch (error) {
        console.error("Error al obtener estrategias:", error);
        // Aquí puedes manejar errores, por ejemplo, mostrando una notificación al usuario
      }
    };

    fetchEstrategias();
  }, [strategicObjectiveId]);

  const filteredEstrategias = useMemo(() => {
    return estrategiasList.filter((est) =>
      est.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estrategiasList, searchTerm]);

  const handleSelectEstrategia = (estrategiaId: string) => {
    const updatedEstrategias = selectedEstrategias.includes(estrategiaId)
      ? selectedEstrategias.filter((id) => id !== estrategiaId)
      : [...selectedEstrategias, estrategiaId];
    onSelectEstrategia(updatedEstrategias);
  };

  const handleRemoveEstrategia = (id: string) => {
    onSelectEstrategia(selectedEstrategias.filter((estId) => estId !== id));
  };

  const onSubmit = async (data: CreateStrategyInput) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la estrategia");
      }

      const createdEstrategia: Estrategia = await response.json();

      // Asignar isCustom a true para estrategias creadas desde el frontend
      const newEstrategia: Estrategia = { ...createdEstrategia, isCustom: true };

      // Actualizar la lista de estrategias
      setEstrategiasList((prev) => [...prev, newEstrategia]);

      // Seleccionar la nueva estrategia
      onSelectEstrategia([...selectedEstrategias, newEstrategia.strategyId.toString()]);

      // Resetear el formulario y cerrar el formulario de agregar
      reset();
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error al agregar nueva estrategia:", error);
      // Aquí puedes manejar errores, por ejemplo, mostrando una notificación al usuario
    }
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAddingNew && newEstrategiaInputRef.current) {
      newEstrategiaInputRef.current.focus();
    }
  }, [isAddingNew]);

  // Define un callback ref para asignar ambos refs
  const handleInputRef = (e: HTMLInputElement | null) => {
    register("description").ref(e);
    if (newEstrategiaInputRef.current && e) {
      newEstrategiaInputRef.current.value = e.value;
    }
  };

  return (
    <div className="space-y-2">
      {/* Mostrar estrategias seleccionadas */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedEstrategias.map((id) => {
          const estrategia = estrategiasList.find(
            (est) => est.strategyId.toString() === id
          );
          if (!estrategia) return null;
          return (
            <TooltipProvider key={id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {estrategia.isCustom ? `E${estrategia.strategyId}` : estrategia.strategyId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                      onClick={() => handleRemoveEstrategia(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{estrategia.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Selector de estrategias */}
      <Select
        onValueChange={handleSelectEstrategia}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm("");
          }
        }}
      >
        <SelectTrigger className="w-[300px] border border-green-500 focus:outline-none focus:ring-0 focus:border-green-600">
          <SelectValue placeholder="Selecciona estrategias" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-green-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar estrategia..."
              className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-green-500 border-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredEstrategias.map((est) => (
                <SelectItem
                  key={est.strategyId}
                  value={est.strategyId.toString()}
                  className="focus:bg-green-100 focus:text-green-800 hover:bg-green-50"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEstrategias.includes(est.strategyId.toString())}
                      onChange={() => handleSelectEstrategia(est.strategyId.toString())}
                      className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    {est.isCustom
                      ? `E${est.strategyId}: ${est.description}`
                      : `${est.strategyId}: ${est.description}`}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>

      {/* Agregar nueva estrategia */}
      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
            <Input
              placeholder="Nueva estrategia..."
              {...register("description", { setValueAs: (value) => {
                handleInputRef(value);
                return value;
              } })}
              className={`h-8 w-[240px] border ${
                errors.description ? "border-red-500" : "border-green-300"
              } focus:outline-none focus:ring-0 focus:border-green-500 shadow-none appearance-none`}
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
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
              variant="ghost"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 px-0"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar nueva estrategia
          </Button>
        )}
      </div>

      {/* Mostrar errores de validación */}
      {errors.description && (
        <span className="text-red-500 text-sm">{errors.description.message}</span>
      )}
    </div>
  );
}
