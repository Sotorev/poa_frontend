// src/components/poa/components/columns/estrategias-selector.tsx
// src/components/poa/components/columns/estrategias-selector.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getEstrategias } from '@/services/apiService';

interface Estrategia {
  strategyId: number;
  description: string;
  strategicObjectiveId: number;
  completionPercentage: number;
  assignedBudget: number;
  executedBudget: number;
  isDeleted: boolean;
  isCustom?: boolean;
}

interface EstrategiasSelectorProps {
  selectedEstrategias: string[];
  onSelectEstrategia: (estrategias: string[]) => void;
  strategicObjectiveIds: number[];
  disabled?: boolean; // Nueva propiedad
  tooltipMessage?: string; // Mensaje del tooltip cuando está deshabilitado
}

export function EstrategiasSelectorComponent({
  selectedEstrategias,
  onSelectEstrategia,
  strategicObjectiveIds,
  disabled = false, // Por defecto, no está deshabilitado
  tooltipMessage = "Seleccione primero un objetivo estratégico.", // Mensaje por defecto
}: EstrategiasSelectorProps) {
  const [estrategiasList, setEstrategiasList] = useState<Estrategia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEstrategias(user?.token || '');

        // Filtrar estrategias que pertenezcan a cualquiera de los strategicObjectiveIds y que no estén eliminadas
        const filteredData = data.filter(est => strategicObjectiveIds.includes(est.strategicObjectiveId) && !est.isDeleted);
        setEstrategiasList(filteredData);
      } catch (error) {
        console.error('Error al obtener estrategias:', error);
      }
    };

    if (!disabled) { // Solo fetch si no está deshabilitado
      fetchData();
    } else {
      setEstrategiasList([]); // Limpiar la lista si está deshabilitado
    }
  }, [strategicObjectiveIds, user?.token, disabled]);

  const filteredEstrategias = useMemo(() => {
    return estrategiasList.filter((est) =>
      est.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estrategiasList, searchTerm]);

  const handleSelectEstrategia = (estrategiaId: string) => {
    if (disabled) return; // No permitir cambios si está deshabilitado
    const updatedEstrategias = selectedEstrategias.includes(estrategiaId)
      ? selectedEstrategias.filter((id) => id !== estrategiaId)
      : [...selectedEstrategias, estrategiaId];
    onSelectEstrategia(updatedEstrategias);
  };

  const handleRemoveEstrategia = (id: string) => {
    if (disabled) return; // No permitir cambios si está deshabilitado
    onSelectEstrategia(selectedEstrategias.filter((estId) => estId !== id));
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Condicional para envolver el Select con Tooltip si está deshabilitado
  const SelectWrapper = disabled ? TooltipProvider : React.Fragment;
  const TooltipContentMessage = disabled ? tooltipMessage : "";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className="space-y-2 w-full max-w-md">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedEstrategias.map((id) => {
                  const estrategia = estrategiasList.find(
                    (est) => est.strategyId.toString() === id
                  );
                  if (!estrategia) return null;
                  return (
                    <Badge key={id} variant="secondary" className="bg-green-100 text-green-800 p-0 flex items-center">
                      <span className="text-green-500 font-bold text-xs mr-1">
                        {estrategia.strategyId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                        onClick={() => handleRemoveEstrategia(id)}
                        disabled={disabled} // Deshabilitar el botón si está deshabilitado
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>

              <Select
                onValueChange={handleSelectEstrategia}
                open={isOpen}
                onOpenChange={(open) => {
                  setIsOpen(open);
                  if (!open) {
                    setSearchTerm("");
                  }
                }}
                disabled={disabled} // Deshabilitar el Select si está deshabilitado
              >
                <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Selecciona estrategias" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar estrategia..."
                      className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-green-500 border-green-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={disabled} // Deshabilitar el input si está deshabilitado
                    />
                  </div>
                  <ScrollArea className="h-[200px]">
                    <SelectGroup>
                      {filteredEstrategias.map((est) => (
                        <SelectItem
                          key={est.strategyId}
                          value={est.strategyId.toString()}
                          className="flex items-start py-2 px-3 cursor-pointer hover:bg-green-50"
                        >
                          <div className="flex items-start w-full">
                            <Checkbox
                              checked={selectedEstrategias.includes(est.strategyId.toString())}
                              onCheckedChange={() => handleSelectEstrategia(est.strategyId.toString())}
                              className="mr-2 mt-1 h-4 w-4 rounded border-green-500 text-green-500 focus:ring-green-500"
                              disabled={disabled} // Deshabilitar el checkbox si está deshabilitado
                            />
                            <div className="flex-shrink-0 w-6 h-6 rounded bg-green-500 text-white font-bold flex items-center justify-center mr-2">
                              {est.strategyId}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex-grow">
                                    <p className="text-sm leading-tight truncate">{est.description}</p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{est.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
        {disabled && <TooltipContent><p>{tooltipMessage}</p></TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
