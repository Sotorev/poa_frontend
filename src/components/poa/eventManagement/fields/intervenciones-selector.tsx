// src/components/poa/components/columns/intervenciones-selector.tsx

'use client';

// Libraries
import React, { useState, useEffect, useMemo, useRef, useContext, useCallback } from 'react';
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

// Types
import { Intervention } from '@/types/Intervention';

// Context
import { EventContext } from '../event.context';

interface IntervencionesProps {
  selectedIntervenciones: { intervention: number; }[];
  onSelectIntervencion: (intervenciones: { intervention: number; }) => void;
  onRemove: (intervencionId: number) => void;
  disabled?: boolean; // Nueva propiedad
  tooltipMessage?: string; // Mensaje del tooltip cuando está deshabilitado
  strategyIds: number[];
}

export function IntervencionesSelectorComponent({
  selectedIntervenciones,
  onSelectIntervencion,
  onRemove,
  disabled = false, // Por defecto, no está deshabilitado
  tooltipMessage = "Por favor, seleccione al menos una estrategia primero.", // Mensaje por defecto
  strategyIds, // Nueva propiedad
}: IntervencionesProps) {
  const [intervencionesList, setIntervencionesList] = useState<Intervention[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { interventions } = useContext(EventContext);

  const fetchData = useCallback(async () => {
    try {
      const filteredIntervenciones = interventions.filter(
        (intervention) => !intervention.isDeleted && strategyIds.includes(intervention.strategyId)
      );
      setIntervencionesList(filteredIntervenciones);
    } catch (error) {

    }
  }, [interventions, strategyIds]);

  useEffect(() => {
    if (!disabled && strategyIds.length > 0) { 
      fetchData();
    } else {
      setIntervencionesList([]);
    }
  }, [disabled, strategyIds, interventions, fetchData]);

  const filteredIntervenciones = useMemo(() => {
    return intervencionesList.filter((intervention) =>
      intervention.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [intervencionesList, searchTerm]);

  const handleSelectIntervencion = (intervencionId: number) => {
    if (disabled) return; // No permitir cambios si está deshabilitado
    if (selectedIntervenciones.some(item => item.intervention === intervencionId)) {
      onRemove(intervencionId);
    } else {
      onSelectIntervencion({ "intervention": intervencionId });
    }
  };

  const handleRemoveIntervencion = (intId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onRemove(intId);
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
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedIntervenciones.map((item) => {
                  const intervencion = intervencionesList.find(
                    (intervention) => intervention.interventionId === item.intervention
                  );
                  if (!intervencion) return null;
                  return (
                    <Badge
                      key={item.intervention}
                      variant="secondary"
                      className={`bg-green-100 text-green-800 flex items-center ${disabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {intervencion.isCustom ? `E${intervencion.interventionId}` : intervencion.interventionId}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                        onClick={(event) => handleRemoveIntervencion(item.intervention, event)}
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
                disabled={disabled}
                onValueChange={(val) => handleSelectIntervencion(Number(val))}
                value=''
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
                      {filteredIntervenciones.map((intervention) => (
                        <SelectItem
                          key={intervention.interventionId}
                          value={intervention.interventionId.toString()}
                          className="focus:bg-green-100 focus:text-green-800 hover:bg-green-50"
                        >
                          <div className="flex items-center">
                            <Checkbox
                              checked={selectedIntervenciones.some(item => item.intervention === intervention.interventionId)}
                              className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                              disabled={disabled} // Deshabilitar el checkbox si está deshabilitado
                            />
                            <div
                              className={`w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold ${intervention.isCustom ? "bg-blue-500" : "bg-green-500"
                                }`}
                            >
                              {intervention.isCustom ? `E${intervention.interventionId}` : intervention.interventionId}
                            </div>
                            {intervention.name}
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
