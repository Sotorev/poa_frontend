// components/ObjetivosEstrategicosSelectorComponent.tsx
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Check, X } from "lucide-react";
import { StrategicObjective } from "@/schemas/strategicObjectiveSchema";
import { StrategicObjectiveForm } from "@/components/strategicObjective/StrategicObjectiveForm";

interface Objetivo {
  id: string;
  name: string;
  number: number;
  isCustom?: boolean;
}

interface ObjetivosEstrategicosProps {
  selectedObjetivos: string[];
  onSelectObjetivo: (objetivo: string) => void;
}

export function ObjetivosEstrategicosSelectorComponent({ selectedObjetivos, onSelectObjetivo }: ObjetivosEstrategicosProps) {
  const [objetivosList, setObjetivosList] = useState<Objetivo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newObjetivoFormRef = useRef<HTMLDivElement>(null); // Ref para el formulario

  // Obtener objetivos estratégicos desde el backend al montar el componente
  useEffect(() => {
    const fetchObjetivos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicobjectives`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data: StrategicObjective[] = await response.json();
        const mappedObjetivos: Objetivo[] = data.map(obj => ({
          id: obj.strategicObjectiveId.toString(),
          name: obj.description,
          number: obj.strategicObjectiveId, // Ajusta según corresponda
          isCustom: false,
        }));
        setObjetivosList(mappedObjetivos);
      } catch (error) {
        console.error("Error al obtener los objetivos estratégicos:", error);
        // Aquí puedes manejar errores, por ejemplo, mostrando una notificación al usuario
      }
    };

    fetchObjetivos();
  }, []);

  const filteredObjetivos = useMemo(() => {
    return objetivosList.filter(obj => 
      obj.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [objetivosList, searchTerm]);

  const handleSelectObjetivo = (objetivo: string) => {
    onSelectObjetivo(objetivo);
    setIsOpen(false);
  };

  const handleAddNewObjetivoSuccess = (createdObjetivo: StrategicObjective) => {
    const newObj: Objetivo = {
      id: createdObjetivo.strategicObjectiveId.toString(),
      name: createdObjetivo.description,
      number: createdObjetivo.strategicObjectiveId, // Ajusta según corresponda
      isCustom: true,
    };

    setObjetivosList(prev => [...prev, newObj]);
    onSelectObjetivo(newObj.id);
    setIsAddingNew(false);
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAddingNew && newObjetivoFormRef.current) {
      const firstInput = newObjetivoFormRef.current.querySelector('input');
      if (firstInput) {
        (firstInput as HTMLInputElement).focus();
      }
    }
  }, [isAddingNew]);

  return (
    <div className="space-y-2">
      <Select 
        onValueChange={handleSelectObjetivo} 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm("");
          }
        }}
        value={selectedObjetivos[0] || undefined}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar objetivo">
            {selectedObjetivos[0] || "Seleccionar objetivo"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-green-500" />
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
                  onSelect={() => handleSelectObjetivo(obj.id)}
                  className={selectedObjetivos.includes(obj.id) ? 'bg-primary/50' : ''}
                >
                  {obj.isCustom ? `E${obj.number}: ${obj.name}` : `${obj.number}: ${obj.name}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <div ref={newObjetivoFormRef} className="w-full">
            <StrategicObjectiveForm onSuccess={handleAddNewObjetivoSuccess} />
            <div className="flex items-center space-x-2 mt-2">
              <Button
                onClick={() => setIsAddingNew(false)}
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 px-0"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar nuevo objetivo
          </Button>
        )}
      </div>
    </div>
  );
}
