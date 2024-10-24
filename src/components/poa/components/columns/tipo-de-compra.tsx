// src/components/poa/components/columns/tipo-de-compra.tsx
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrentUser } from "@/hooks/use-current-user";

interface TipoDeCompra {
  id: string;
  name: string;
  color: string;
}

interface TipoDeCompraComponentProps {
  selectedTipos: string[];
  onSelectTipos: (tipos: string[]) => void;
}

const predefinedColors: string[] = [
  "#1E3A8A", "#3C1053", "#065F46", "#831843", "#713F12",
  "#1F2937", "#7C2D12", "#134E4A", "#4C1D95", "#701A75",
  "#064E3B", "#6B21A8", "#7E22CE", "#92400E", "#0F766E"
];

export default function TipoDeCompraComponent({ selectedTipos, onSelectTipos }: TipoDeCompraComponentProps) {
  const user = useCurrentUser();
  const [tiposDeCompra, setTiposDeCompra] = useState<TipoDeCompra[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newTipoInputRef = useRef<HTMLInputElement>(null);

  const fetchTiposDeCompra = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchasetypes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener tipos de compra: ${response.statusText}`);
      }

      const data = await response.json();
      const activeTipos = data.filter((tipo: any) => !tipo.isDeleted);
      const mappedTipos: TipoDeCompra[] = activeTipos.map((tipo: any, index: number) => ({
        id: tipo.purchaseTypeId.toString(),
        name: tipo.name,
        color: predefinedColors[index % predefinedColors.length],
      }));
      setTiposDeCompra(mappedTipos);
    } catch (error) {
      console.error("Error al obtener tipos de compra:", error);
      // Opcional: manejar el estado de error si es necesario
    }
  };

  useEffect(() => {
    fetchTiposDeCompra();
  }, [user?.token]);

  const filteredTipos = useMemo(() => {
    return tiposDeCompra.filter(tipo =>
      tipo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tiposDeCompra, searchTerm]);

  const handleSelectTipo = (tipoId: string) => {
    const newSelection = selectedTipos.includes(tipoId)
      ? selectedTipos.filter(id => id !== tipoId)
      : [...selectedTipos, tipoId];
    onSelectTipos(newSelection);
    // Refocus the search input
    setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const handleRemoveTipo = (tipoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedTipos = selectedTipos.filter(id => id !== tipoId);
    onSelectTipos(updatedTipos);
  };

  const handleAddNewTipo = () => {
    if (newTipoName.trim()) {
      const newTipo: TipoDeCompra = {
        id: (tiposDeCompra.length + 1).toString(),
        name: newTipoName.trim(),
        color: predefinedColors[tiposDeCompra.length % predefinedColors.length],
      };
      setTiposDeCompra([...tiposDeCompra, newTipo]);
      onSelectTipos([...selectedTipos, newTipo.id]);
      setNewTipoName("");
      setIsAddingNew(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAddingNew && newTipoInputRef.current) {
      newTipoInputRef.current.focus();
    }
  }, [isAddingNew]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedTipos.map(id => {
          const tipo = tiposDeCompra.find(t => t.id === id);
          if (!tipo) return null;
          return (
            <TooltipProvider key={tipo.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: tipo.color, color: 'white' }}
                  >
                    <span className="flex items-center">
                      {tipo.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveTipo(tipo.id, e)}
                      aria-label={`Eliminar ${tipo.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tipo.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      <Select
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setTimeout(() => searchInputRef.current?.focus(), 0);
          } else {
            setSearchTerm("");
          }
        }}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona tipos de compra" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar tipo de compra..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={(e) => {
                // Prevent the input from losing focus
                e.preventDefault();
                e.target.focus();
              }}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredTipos.map((tipo) => (
                <SelectItem
                  key={tipo.id}
                  value={tipo.id}
                  className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent cursor-pointer"
                  style={{ borderBottom: 'none' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectTipo(tipo.id);
                  }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedTipos.includes(tipo.id)}
                      onCheckedChange={() => handleSelectTipo(tipo.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTipo(tipo.id);
                      }}
                      className="mr-2 h-4 w-4 rounded border-2 focus:ring-offset-0"
                      style={{
                        borderColor: tipo.color,
                        backgroundColor: selectedTipos.includes(tipo.id) ? tipo.color : 'transparent',
                      }}
                    />
                    {tipo.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <div className="flex items-center space-x-2">
            <Input
              ref={newTipoInputRef}
              placeholder="Nuevo tipo de compra..."
              value={newTipoName}
              onChange={(e) => setNewTipoName(e.target.value)}
              className="h-8 w-[240px] border border-green-300 focus:outline-none focus:ring-0 focus:border-green-500 shadow-none appearance-none"
            />
            <Button
              onClick={handleAddNewTipo}
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setIsAddingNew(false);
                setNewTipoName("");
              }}
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 px-0"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar nuevo tipo de compra
          </Button>
        )}
      </div>
    </div>
  );
}