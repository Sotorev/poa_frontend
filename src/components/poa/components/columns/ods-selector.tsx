// src/components/poa/components/columns/ods-selector.tsx
'use client'

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
import { Search, X, Check, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOdsSchema, CreateOdsInput } from "@/schemas/odsSchema";
import { z } from "zod";
import { ODS } from "@/types/ods";

interface ODSWithFrontend extends ODS {
  id: string;
  number: number;
  color: string;
}

interface ODSSelectorProps {
  selectedODS: string[];
  onSelectODS: (ods: string[]) => void;
}



const predefinedOdsList: ODSWithFrontend[] = [
  { id: "1", name: "Fin de la pobreza", number: 1, color: "#E5243B", odsId: 1, isDeleted: false },
  { id: "2", name: "Hambre cero", number: 2, color: "#DDA63A", odsId: 2, isDeleted: false },
  { id: "3", name: "Salud y bienestar", number: 3, color: "#4C9F38", odsId: 3, isDeleted: false },
  { id: "4", name: "Educación de calidad", number: 4, color: "#C5192D", odsId: 4, isDeleted: false },
  { id: "5", name: "Igualdad de género", number: 5, color: "#FF3A21", odsId: 5, isDeleted: false },
  { id: "6", name: "Agua limpia y saneamiento", number: 6, color: "#26BDE2", odsId: 6, isDeleted: false },
  { id: "7", name: "Energía asequible y no contaminante", number: 7, color: "#FCC30B", odsId: 7, isDeleted: false },
  { id: "8", name: "Trabajo decente y crecimiento económico", number: 8, color: "#A21942", odsId: 8, isDeleted: false },
  { id: "9", name: "Industria, innovación e infraestructura", number: 9, color: "#FD6925", odsId: 9, isDeleted: false },
  { id: "10", name: "Reducción de las desigualdades", number: 10, color: "#DD1367", odsId: 10, isDeleted: false },
  { id: "11", name: "Ciudades y comunidades sostenibles", number: 11, color: "#FD9D24", odsId: 11, isDeleted: false },
  { id: "12", name: "Producción y consumo responsables", number: 12, color: "#BF8B2E", odsId: 12, isDeleted: false },
  { id: "13", name: "Acción por el clima", number: 13, color: "#3F7E44", odsId: 13, isDeleted: false },
  { id: "14", name: "Vida submarina", number: 14, color: "#0A97D9", odsId: 14, isDeleted: false },
  { id: "15", name: "Vida de ecosistemas terrestres", number: 15, color: "#56C02B", odsId: 15, isDeleted: false },
  { id: "16", name: "Paz, justicia e instituciones sólidas", number: 16, color: "#00689D", odsId: 16, isDeleted: false },
  { id: "17", name: "Alianzas para lograr los objetivos", number: 17, color: "#19486A", odsId: 17, isDeleted: false },
];


export function OdsSelector({ selectedODS, onSelectODS }: ODSSelectorProps) {
  const [odsList, setOdsList] = useState<ODSWithFrontend[]>(predefinedOdsList);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [customOdsCounter, setCustomOdsCounter] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newOdsInputRef = useRef<HTMLInputElement>(null);

  // Configurar react-hook-form para agregar nuevos ODS
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOdsInput>({
    resolver: zodResolver(createOdsSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch de ODS desde el backend al montar el componente
  useEffect(() => {
    const fetchOds = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ods`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error al obtener ODS: ${response.statusText}`);
        }
        const data: ODS[] = await response.json();
        // Filtrar ODS no eliminados
        const filteredOds = data.filter(ods => !ods.isDeleted);
        console.log("ODS obtenidos del backend:", filteredOds); // Para depuración

        // Mapear los ODS obtenidos con la lista predefinida para asignar número y color
        const mappedOds: ODSWithFrontend[] = filteredOds.map(ods => {
          const predefined = predefinedOdsList.find(pods => pods.name.toLowerCase() === ods.name.toLowerCase());
          if (predefined) {
            return {
              ...ods,
              id: predefined.id,
              number: predefined.number,
              color: predefined.color,
            };
          } else {
            // Asignar número y color para nuevos ODS
            const newNumber = odsList.length + customOdsCounter;
            setCustomOdsCounter(prev => prev + 1);
            return {
              ...ods,
              id: `custom-ods-${ods.odsId}`,
              number: newNumber,
              color: "#808080", // Color por defecto para nuevos ODS
            };
          }
        });

        setOdsList(mappedOds);
      } catch (error) {
        console.error("Error al obtener ODS:", error);
        // Aquí puedes manejar errores, por ejemplo, mostrando una notificación al usuario
      }
    };

    fetchOds();
  }, []);

  const filteredODS = useMemo(() => {
    const filtered = odsList.filter(ods =>
      ods.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("ODS filtrados:", filtered); // Para depuración
    return filtered;
  }, [odsList, searchTerm]);

  const handleSelectODS = (odsId: string) => {
    const updatedODS = selectedODS.includes(odsId)
      ? selectedODS.filter(id => id !== odsId)
      : [...selectedODS, odsId];
    onSelectODS(updatedODS);
    console.log("ODS seleccionados:", updatedODS); // Para depuración
  };

  const handleRemoveODS = (odsId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedODS = selectedODS.filter(id => id !== odsId);
    onSelectODS(updatedODS);
    console.log("ODS después de remover:", updatedODS); // Para depuración
  };

  const onSubmit = async (data: CreateOdsInput) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el ODS");
      }

      const createdOds: ODS = await response.json();
      console.log("Nuevo ODS creado:", createdOds); // Para depuración

      // Asignar número y color para el nuevo ODS
      const newNumber = odsList.length + customOdsCounter;
      setCustomOdsCounter(prev => prev + 1);
      const newOds: ODSWithFrontend = {
        ...createdOds,
        id: `custom-ods-${createdOds.odsId}`,
        number: newNumber,
        color: "#808080", // Color por defecto para nuevos ODS
      };

      // Actualizar la lista de ODS
      setOdsList(prev => [...prev, newOds]);

      // Seleccionar el nuevo ODS
      onSelectODS([...selectedODS, newOds.id]);
      console.log("ODS seleccionados después de agregar nuevo:", [...selectedODS, newOds.id]); // Para depuración

      // Resetear el formulario y cerrar el formulario de agregar
      reset();
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error al agregar nuevo ODS:", error);
      // Aquí puedes manejar errores, por ejemplo, mostrando una notificación al usuario
    }
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAddingNew && newOdsInputRef.current) {
      newOdsInputRef.current.focus();
    }
  }, [isAddingNew]);

  return (
    <div className="space-y-2">
      {/* Mostrar ODS seleccionados */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedODS.map(id => {
          const ods = odsList.find(o => o.id === id);
          if (!ods) return null;
          return (
            <TooltipProvider key={ods.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: ods.color, color: 'white' }}
                  >
                    <span>{ods.number}</span>
                    <button
                      className="ml-1 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveODS(ods.id, e)}
                      aria-label={`Eliminar ${ods.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{ods.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Selector de ODS */}
      <Select
        onValueChange={handleSelectODS}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm("");
          }
        }}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona ODS" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar ODS..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredODS.map((ods) => (
                <SelectItem 
                  key={ods.id} 
                  value={ods.id} 
                  className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                  style={{ borderBottom: 'none' }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedODS.includes(ods.id)}
                      onCheckedChange={() => handleSelectODS(ods.id)}
                      className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                      style={{
                        borderColor: ods.color,
                        backgroundColor: selectedODS.includes(ods.id) ? ods.color : 'transparent',
                      }}
                    />
                    <div 
                      className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: ods.color }}
                    >
                      {ods.number}
                    </div>
                    {ods.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>

      {/* Agregar nuevo ODS */}
      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
            <Input
              {...register("name")} // Vincula directamente el input con el registro de React Hook Form
              placeholder="Nuevo ODS..."
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
            Agregar nuevo ODS
          </Button>
        )}
      </div>

      {/* Mostrar errores de validación */}
      {errors.name && (
        <span className="text-red-500 text-sm">{errors.name.message}</span>
      )}
    </div>
  );
}
