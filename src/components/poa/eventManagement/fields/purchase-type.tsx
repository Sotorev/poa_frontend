// src/components/poa/components/columns/tipo-de-compra.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
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
import { Search, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { PurchaseTypeWithColor } from '@/types/PurchaseType';
import { EventContext } from "../event.context";

interface PurchaseTypeProps {
  selectedTipo: number | null;
  onSelectTipo: (tipo: number | null) => void;
}

const predefinedColors: string[] = [
  "#1E3A8A", "#3C1053", "#065F46", "#831843", "#713F12",
  "#1F2937", "#7C2D12", "#134E4A", "#4C1D95", "#701A75",
  "#064E3B", "#6B21A8", "#7E22CE", "#92400E", "#0F766E"
];

export function PurchaseType({ selectedTipo, onSelectTipo }: PurchaseTypeProps) {
  const [tiposDeCompra, setTiposDeCompra] = useState<PurchaseTypeWithColor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTipoName, setNewTipoName] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newTipoInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { purchaseTypes } = useContext(EventContext);

  // Función para asignar un color basado en el índice
  const getColor = (index: number): string => predefinedColors[index % predefinedColors.length];

  const fetchTiposDeCompra = async () => {
    setLoading(true);
    try {
      const mappedTipos: PurchaseTypeWithColor[] = purchaseTypes.map((tipo, index) => ({
        ...tipo,
        color: getColor(index),
      }));
      setTiposDeCompra(mappedTipos);
    } catch (error) {
      setError('No se pudieron cargar los tipos de compra.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposDeCompra();
  }, [purchaseTypes]);

  const filteredTipos = useMemo(() => {
    return tiposDeCompra.filter(tipo =>
      tipo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tiposDeCompra, searchTerm]);

  const handleSelectTipo = (tipoId: string) => {
    onSelectTipo(selectedTipo === Number(tipoId) ? null : Number(tipoId));
    setIsOpen(false);
  };

  const handleRemoveTipo = (tipoId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectTipo(null);
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

  if (loading) return <div className="text-green-600">Cargando tipos de compra...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-2">
      {/* Mostrar Tipo de Compra seleccionado */}
      {selectedTipo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                style={{ backgroundColor: tiposDeCompra.find(t => t.purchaseTypeId === selectedTipo)?.color || '#808080', color: 'white' }}
              >
                <span className="flex items-center">
                  {tiposDeCompra.find(t => t.purchaseTypeId === selectedTipo)?.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-4 w-4 p-0 text-white hover:text-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTipo(null);
                  }}
                  aria-label={`Eliminar ${tiposDeCompra.find(t => t.purchaseTypeId === selectedTipo)?.name}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tiposDeCompra.find(t => t.purchaseTypeId === selectedTipo)?.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Selector de Tipo de Compra */}
      <Select
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm("");
          }
        }}
        onValueChange={handleSelectTipo}
        value={selectedTipo ? selectedTipo.toString() : undefined}
      >
        <SelectTrigger className="border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
          <SelectValue placeholder="Selecciona tipos de compra" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar tipo de compra..."
              className="h-8 w-full border-primary bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={(e) => {
                // Prevenir que el input pierda el foco
                e.preventDefault();
                e.target.focus();
              }}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredTipos.map((tipo) => (
                <SelectItem
                  key={tipo.purchaseTypeId}
                  value={tipo.purchaseTypeId.toString()}
                  className="flex items-center hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedTipo === tipo.purchaseTypeId}
                      onCheckedChange={() => handleSelectTipo(tipo.purchaseTypeId.toString())}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTipo(tipo.purchaseTypeId.toString());
                      }}
                      className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                      style={{
                        borderColor: tipo.color,
                        backgroundColor: selectedTipo === tipo.purchaseTypeId ? tipo.color : 'transparent',
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

      {/* Mostrar errores de creación */}
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  );
}
