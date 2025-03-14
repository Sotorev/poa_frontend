// src/components/RecursosSelectorComponent.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
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
import { EventContext } from '../context.event';

interface ResourceWithFrontend extends Resource {
  id: number;
  number: number;
  color: string;
  isCustom?: boolean;
}

interface RecursosSelectorProps {
  selectedResource: { resourceId: number }[];
  onAppendResource: (resource: { resourceId: number }) => void;
  onRemoveResource: (index: number) => void;
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

export function RecursosSelectorComponent({ selectedResource, onAppendResource, onRemoveResource }: RecursosSelectorProps) {
  const [recursosList, setRecursosList] = useState<ResourceWithFrontend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { resources } = useContext(EventContext);

  // Simplified approach to get selected IDs (similar to ods-selector)
  const selectedResourceIds = useMemo(() => {
    return selectedResource.map((item) => item.resourceId);
  }, [selectedResource]);

  // Asignar colores de forma circular para evitar quedarse sin colores
  const getColor = (index: number): string => {
    return predefinedColors[index % predefinedColors.length];
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mapear los recursos obtenidos para añadir number y color
        const mappedRecursos: ResourceWithFrontend[] = resources.map((rec, index) => ({
          ...rec,
          id: rec.resourceId,
          number: index + 1,
          color: getColor(index),
        }));

        setRecursosList(mappedRecursos);
      } catch (error) {
        console.error('Error al obtener recursos:', error);
      }
    };

    fetchData();
  }, [resources]);

  const filteredRecursos = useMemo(() => {
    return recursosList.filter((rec) =>
      rec.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recursosList, searchTerm]);

  // Simplified handler following OdsSelector pattern
  const handleSelectRecurso = (recId: string) => {
    const resourceId = Number(recId);
    if (selectedResourceIds.includes(resourceId)) {
      const indexToRemove = selectedResource.findIndex(
        (item) => item.resourceId === resourceId
      );
      if (indexToRemove !== -1) {
        onRemoveResource(indexToRemove);
      }
    } else {
      onAppendResource({ resourceId });
    }
  };

  const handleRemoveRecurso = (recId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const resourceId = Number(recId);

    // Find the index to remove (simplified)
    const indexToRemove = selectedResource.findIndex(
      (item) => item.resourceId === resourceId
    );

    if (indexToRemove !== -1) {
      onRemoveResource(indexToRemove);
    }
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
        {selectedResourceIds.map(id => {
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
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveRecurso(recurso.id.toString(), e)}
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
        value=""
      >
        <SelectTrigger className="w-[300px] border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
          <SelectValue placeholder="Selecciona recursos" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar recurso..."
              className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredRecursos.map((rec) => {
                // Direct check like in OdsSelector
                const isSelected = selectedResourceIds.includes(rec.id);

                return (
                  <SelectItem
                    key={rec.id}
                    value={rec.id.toString()}
                    className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                    style={{ borderBottom: 'none' }}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          handleSelectRecurso(rec.id.toString());
                        }}
                        className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                        style={{
                          borderColor: rec.color,
                          backgroundColor: isSelected ? rec.color : 'transparent',
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
                );
              })}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
