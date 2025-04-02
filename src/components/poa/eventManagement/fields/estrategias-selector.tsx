// src/components/poa/components/columns/estrategias-selector.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useContext } from 'react';
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

// hooks
import { useCurrentUser } from '@/hooks/use-current-user';

// Context
import { EventContext } from '../context.event';

// Types
import { Strategy } from '@/types/Strategy';
interface Estrategia {
  strategyId: number;
  description: string;
  strategicAreaId: number;
  completionPercentage: number;
  assignedBudget: number;
  executedBudget: number;
  isDeleted: boolean;
  isCustom?: boolean;
}

interface EstrategiasSelectorProps {
  selectedEstrategias: Strategy[];
  onSelectEstrategia: (estrategias: Strategy[]) => void;
  strategicObjectiveIds: number | undefined;
  disabled?: boolean;
}

export function EstrategiasSelectorComponent({
  selectedEstrategias,
  onSelectEstrategia,
  strategicObjectiveIds,
  disabled = false, 
}: EstrategiasSelectorProps) {
  const [estrategiasList, setEstrategiasList] = useState<Estrategia[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();
  const { strategics } = useContext(EventContext);

  const fetchData = useCallback(async () => {
    try {
      if (!strategicObjectiveIds) return; // Si no hay objetivos estratégicos, no hacer nada
      const filteredData = strategics.filter(est => est.strategicAreaId === strategicObjectiveIds);
      setEstrategiasList(filteredData);

    } catch (error) {
      console.error('Error al obtener estrategias:', error);
    }
  }, [strategicObjectiveIds, strategics]);

  useEffect(() => {
    if (!disabled) { // Solo fetch si no está deshabilitado
      fetchData();
    } else {
      setEstrategiasList([]); // Limpiar la lista si está deshabilitado
    }
  }, [strategicObjectiveIds, user?.token, disabled, strategics, fetchData]);

  const filteredEstrategias = useMemo(() => {
    return estrategiasList.filter((est) =>
      est.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estrategiasList, searchTerm]);

  const handleSelectEstrategia = (estrategiaId: string) => {
    if (disabled) return; // No permitir cambios si está deshabilitado
    const estrategia = estrategiasList.find(est => est.strategyId.toString() === estrategiaId);
    if (!estrategia) return;
    
    const updatedEstrategias = selectedEstrategias.some(est => est.strategyId.toString() === estrategiaId)
      ? selectedEstrategias.filter(est => est.strategyId.toString() !== estrategiaId)
      : [...selectedEstrategias, estrategia];
    
    onSelectEstrategia(updatedEstrategias);
  };

  const handleRemoveEstrategia = (id: string) => {
    if (disabled) return; // No permitir cambios si está deshabilitado
    const updatedEstrategias = selectedEstrategias.filter(est =>
      est.strategyId.toString() !== id
    );
    onSelectEstrategia(updatedEstrategias);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className="space-y-2 w-full max-w-md">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedEstrategias.map((estrategia) => {
                  const foundEstrategia = estrategiasList.find(
                    (est) => est.strategyId === estrategia.strategyId
                  );
                  if (!estrategia) return null;
                  return (
                    <Badge key={estrategia.strategyId} variant="secondary" className="bg-primary/10 text-primary p-0 flex items-center">
                      <span className="text-primary font-bold text-xs mr-1">
                        {estrategia.strategyId}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleRemoveEstrategia(estrategia.strategyId.toString())}
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
                value=""
                disabled={disabled} // Deshabilitar el Select si está deshabilitado
              >
                <SelectTrigger className="w-[300px] border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Selecciona estrategias" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar estrategia..."
                      className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-primary border-primary"
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
                          className="flex items-start py-2 px-3 cursor-pointer hover:bg-primary/10"
                        >
                          <div className="flex items-start w-full">
                            <Checkbox
                              checked={selectedEstrategias.some(strategy => strategy.strategyId.toString() === est.strategyId.toString())}
                              onCheckedChange={() => handleSelectEstrategia(est.strategyId.toString())}
                              className="mr-2 mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                              disabled={disabled} // Deshabilitar el checkbox si está deshabilitado
                            />
                            <div className="flex-shrink-0 w-6 h-6 rounded bg-primary text-white font-bold flex items-center justify-center mr-2">
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
        {disabled && <TooltipContent><p>{"Seleccione primero un objetivo estratégico."}</p></TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
