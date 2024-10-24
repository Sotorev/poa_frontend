// src/components/poa/components/columns/estrategias-selector.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStrategySchema, CreateStrategyInput } from "@/schemas/strategySchema";
import { useCurrentUser } from "@/hooks/use-current-user";

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
  strategicObjectiveId: number;
}

export function EstrategiasSelectorComponent({
  selectedEstrategias,
  onSelectEstrategia,
  strategicObjectiveId,
}: EstrategiasSelectorProps) {
  const [estrategiasList, setEstrategiasList] = useState<Estrategia[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateStrategyInput>({
    resolver: zodResolver(createStrategySchema),
    defaultValues: {
      description: "",
      strategicObjectiveId: strategicObjectiveId,
    },
  });

  useEffect(() => {
    const fetchEstrategias = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategies`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error al fetch estrategias: ${response.statusText}`);
        }
        const data: Estrategia[] = await response.json();
        setEstrategiasList(data);
      } catch (error) {
        console.error("Error al obtener estrategias:", error);
      }
    };

    fetchEstrategias();
  }, [strategicObjectiveId]);

  const filteredEstrategias = useMemo(() => {
    return estrategiasList.filter((est) =>
      est.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estrategiasList, searchTerm]);

  const handleSelectEstrategia = (estrategiaId: string) => {
    const updatedEstrategias = selectedEstrategias.includes(estrategiaId)
      ? selectedEstrategias.filter((id) => id !== estrategiaId)
      : [...selectedEstrategias, estrategiaId];
    onSelectEstrategia(updatedEstrategias);
  };

  const handleRemoveEstrategia = (id: string) => {
    onSelectEstrategia(selectedEstrategias.filter((estId) => estId !== id));
  };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="space-y-2 w-full max-w-md">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedEstrategias.map((id) => {
          const estrategia = estrategiasList.find(
            (est) => est.strategyId.toString() === id
          );
          if (!estrategia) return null;
          return (
            <TooltipProvider key={id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 p-0 flex items-center">
                    <span className="text-green-500 font-bold text-xs mr-1">
                      {estrategia.strategyId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                      onClick={() => handleRemoveEstrategia(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{estrategia.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
  );
}