// src/components/poa/components/columns/intervenciones-selector.tsx
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getIntervenciones } from '@/services/apiService';

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

export function IntervencionesSelectorComponent({
  selectedIntervenciones,
  onSelectIntervencion,
}: IntervencionesProps) {
  const [intervencionesList, setIntervencionesList] = useState<Intervencion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getIntervenciones(user?.token || '');
        const filteredIntervenciones = data.filter((intervencion) => !intervencion.isDeleted);
        setIntervencionesList(filteredIntervenciones);
      } catch (error) {
        console.error('Error al obtener intervenciones:', error);
      }
    };

    fetchData();
  }, [user?.token]);

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
    const updatedIntervenciones = selectedIntervenciones.filter((id) => id !== intId);
    onSelectIntervencion(updatedIntervenciones);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

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
                    {intervencion.isCustom
                      ? `E${intervencion.interventionId}`
                      : intervencion.interventionId}
                    <button
                      className="ml-1 h-4 w-4 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                      onClick={(event) => handleRemoveIntervencion(id, event)}
                      aria-label={`Eliminar ${intervencion.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
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
        <SelectTrigger className="border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
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
                      onCheckedChange={() =>
                        handleSelectIntervencion(int.interventionId.toString())
                      }
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
    </div>
  );
}
