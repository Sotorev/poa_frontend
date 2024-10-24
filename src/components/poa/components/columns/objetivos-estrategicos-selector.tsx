// src/components/poa/components/columns/objetivos-estrategicos-selector.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Check } from "lucide-react";
import { StrategicObjective } from "@/schemas/strategicObjectiveSchema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Objetivo {
  id: string;
  name: string;
  number: number;
  isCustom?: boolean;
}

interface ObjetivosEstrategicosProps {
  selectedObjetivos: string[];
  onSelectObjetivo: (objetivo: string) => void;
  strategicObjectives: StrategicObjective[];
  addStrategicObjective: (objetivo: StrategicObjective) => void;
}

export function ObjetivosEstrategicosSelectorComponent({ selectedObjetivos, onSelectObjetivo, strategicObjectives, addStrategicObjective }: ObjetivosEstrategicosProps) {
  const [objetivosList, setObjetivosList] = useState<Objetivo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mappedObjetivos: Objetivo[] = strategicObjectives.map(obj => ({
      id: obj.strategicObjectiveId.toString(),
      name: obj.description,
      number: obj.strategicObjectiveId,
      isCustom: false,
    }))
    setObjetivosList(mappedObjetivos)
  }, [strategicObjectives])

  const filteredObjetivos = useMemo(() => {
    return objetivosList.filter(obj => 
      obj.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [objetivosList, searchTerm]);

  const handleSelectObjetivo = (objetivo: string) => {
    onSelectObjetivo(objetivo);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedObjetivo = objetivosList.find(obj => obj.id === selectedObjetivos[0]);

  return (
    <div className="space-y-2 w-full max-w-md">
      <Select 
        onValueChange={handleSelectObjetivo} 
        open={isOpen} 
        onOpenChange={setIsOpen}
        value={selectedObjetivos[0] || undefined}
      >
        <SelectTrigger className="w-full border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Seleccionar objetivo">
            {selectedObjetivo && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center w-full">
                      <div className="flex-shrink-0 w-6 h-6 rounded bg-green-500 text-white font-bold flex items-center justify-center mr-2">
                        {selectedObjetivo.number}
                      </div>
                      <span className="truncate flex-grow">{selectedObjetivo.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-xs">
                    <p>{selectedObjetivo.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar objetivo..."
              className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-green-500 border-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredObjetivos.map((obj) => (
                <SelectItem
                  key={obj.id}
                  value={obj.id}
                  className="flex items-start py-2 px-3 cursor-pointer hover:bg-green-50"
                >
                  <div className="flex items-start w-[300px]">
                    <div className={`flex-shrink-0 w-6 h-6 rounded ${
                      selectedObjetivos.includes(obj.id) ? 'bg-green-700' : 'bg-green-500'
                    } text-white font-bold flex items-center justify-center mr-2`}>
                      {obj.number}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm leading-tight">{obj.name}</p>
                    </div>
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