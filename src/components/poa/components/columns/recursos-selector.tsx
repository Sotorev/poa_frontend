// src/components/RecursosSelectorComponent.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Resource } from '@/types/Resource';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getResources } from '@/services/apiService';

interface ResourceWithFrontend extends Resource {
  id: string;
  number: number;
  color: string;
  isCustom?: boolean;
}

interface RecursosSelectorProps {
  selectedRecursos: string[];
  onSelectRecursos: (recursos: string[]) => void;
}

const predefinedColors: string[] = [
  "#1E3A8A", // Azul marino profundo
  "#3C1053", // Púrpura oscuro
  "#065F46", // Verde bosque
  "#831843", // Borgoña
  "#713F12", // Marrón chocolate
  "#1F2937", // Gris pizarra
  "#7C2D12", // Terracota oscuro
  "#134E4A", // Verde azulado oscuro
  "#4C1D95", // Índigo profundo
  "#701A75", // Magenta oscuro
  "#064E3B", // Verde esmeralda oscuro
  "#6B21A8", // Violeta oscuro
  "#7E22CE", // Púrpura real
  "#92400E", // Ámbar oscuro
  "#0F766E"  // Turquesa oscuro
];

export function RecursosSelectorComponent({ selectedRecursos, onSelectRecursos }: RecursosSelectorProps) {
  const [recursosList, setRecursosList] = useState<ResourceWithFrontend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();
    // Asignar colores de forma circular para evitar quedarse sin colores
    const getColor = (index: number): string => {
      return predefinedColors[index % predefinedColors.length];
    };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getResources(user?.token || '');
        // Mapear los recursos obtenidos para añadir number y color
        const mappedRecursos: ResourceWithFrontend[] = data.map((rec, index) => ({
          ...rec,
          id: rec.resourceId.toString(),
          number: index + 1,
          color: getColor(index),
        }));

        setRecursosList(mappedRecursos);
      } catch (error) {
        console.error('Error al obtener recursos:', error);
      }
    };

    fetchData();
  }, [user?.token]);

  const filteredRecursos = useMemo(() => {
    return recursosList.filter((rec) =>
      rec.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recursosList, searchTerm]);

  const handleSelectRecurso = (recId: string) => {
    const newSelection = selectedRecursos.includes(recId)
      ? selectedRecursos.filter((id) => id !== recId)
      : [...selectedRecursos, recId];
    onSelectRecursos(newSelection);
  };

  const handleRemoveRecurso = (recId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedRecursos = selectedRecursos.filter((id) => id !== recId);
    onSelectRecursos(updatedRecursos);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="space-y-2">
      {/* Mostrar recursos seleccionados */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedRecursos.map(id => {
          const recurso = recursosList.find(rec => rec.id === id);
          if (!recurso) return null;
          return (
            <TooltipProvider key={recurso.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: recurso.color, color: 'white' }}
                  >
                    <span className="flex items-center">
                      <span className="w-5 h-5 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: recurso.color }}>
                        {recurso.isCustom ? 'E' : recurso.number}
                      </span>
                      {recurso.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveRecurso(recurso.id, e)}
                      aria-label={`Eliminar ${recurso.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{recurso.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Selector de recursos */}
      <Select
        onValueChange={handleSelectRecurso}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm("");
          }
        }}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona recursos" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar recurso..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredRecursos.map((rec) => (
                <SelectItem
                  key={rec.id}
                  value={rec.id}
                  className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                  style={{ borderBottom: 'none' }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedRecursos.includes(rec.id)}
                      onCheckedChange={() => handleSelectRecurso(rec.id)}
                      className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                      style={{
                        borderColor: rec.color,
                        backgroundColor: selectedRecursos.includes(rec.id) ? rec.color : 'transparent',
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: rec.color }}
                    >
                      {rec.isCustom ? 'E' : rec.number}
                    </div>
                    {rec.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>

      {/* Agregar nuevo recurso
      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
            <Input
              placeholder="Nuevo recurso..."
              ref={(e) => {
                if (e) {
                  register("name").ref(e);
                }
              }}
              className={`h-8 w-[240px] border ${
                errors.name ? "border-red-500" : "border-green-300"
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
            Agregar nuevo recurso
          </Button>
        )}
      </div> */}

      {/* Mostrar errores de validación */}
      {/* {errors.name && (
        <span className="text-red-500 text-sm">{errors.name.message}</span>
      )} */}
    </div>
  );
}
