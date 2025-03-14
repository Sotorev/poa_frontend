// src/components/poa/eventManagement/fields/financing-source.tsx
"use client"

import { useContext, useMemo, useEffect, useState } from "react"
import { EventContext } from "../context.event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Types
import { FinancingSourceRequest } from "../formView/schema.eventPlanningForm"


interface FinancingSourceProps {
  contributions: FinancingSourceRequest[]
  onAppendContribution: (contribution: FinancingSourceRequest) => void
  onRemoveContribution: (index: number) => void
  onUpdateContribution: (index: number, contribution: FinancingSourceRequest) => void
  onTotalCost: (totalCost: number) => void
  isUMES: boolean
}

export function FinancingSource({
  contributions,
  onAppendContribution,
  onRemoveContribution,
  onUpdateContribution,
  onTotalCost,
  isUMES,
}: FinancingSourceProps) {
  // Obtener las fuentes de financiamiento del contexto
  const { financingSources } = useContext(EventContext)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  // Filtrar las fuentes de financiamiento según la categoría
  const filteredSources = useMemo(() => {
    return financingSources?.filter(
      (source) => !source.isDeleted && (isUMES ? source.category === "UMES" : source.category === "Otra"),
    )
  }, [financingSources, isUMES])

  // Función para verificar si la fuente seleccionada es "No aplica"
  const isNoAplica = (financingSourceId: number) => {
    const source = financingSources?.find(src => src.financingSourceId === financingSourceId);
    return source?.name === "No Aplica";
  }

  // Función para manejar el cambio de fuente de financiamiento
  const handleSourceChange = (index: number, value: string) => {
    const financingSourceId = Number.parseInt(value, 10)
    
    // Si la fuente seleccionada es "No aplica", establecer el monto a 0
    const amount = isNoAplica(financingSourceId) ? 0 : contributions[index].amount;
    
    onUpdateContribution(index, {
      ...contributions[index],
      financingSourceId,
      amount,
    })
  }

  const calculateTotalCost = (): number => {
    return contributions.reduce((acc, contribution) => acc + contribution.amount
      , 0)
  }

  // Format number as Quetzal currency
  const formatAsQuetzal = (value: number): string => {
    return `Q ${value.toFixed(2)}`;
  };

  // Parse Quetzal formatted string back to number
  const parseQuetzalValue = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    return value.replace(/[^0-9.]/g, '');
  };

  // Function to limit decimal places to 2
  const limitDecimalPlaces = (value: string): string => {
    if (!value) return '';
    
    // Split by decimal point
    const parts = value.split('.');
    
    // If there's a decimal part with more than 2 digits, truncate it
    if (parts.length > 1 && parts[1].length > 2) {
      return `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
    
    return value;
  };

  // Función para manejar el cambio de monto (version para edición)
  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers and a single decimal point
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    
    if (value === '' || numericRegex.test(value)) {
      // Store the current input value
      setInputValues({
        ...inputValues,
        [index]: limitDecimalPlaces(value)
      });
      
      // Also update the actual amount in real-time
      const amount = value ? Number.parseFloat(value) || 0 : 0;
      onUpdateContribution(index, {
        ...contributions[index],
        amount,
      });
    }
  };

  // Function to commit the input value to the actual amount (on blur)
  const commitValueChange = (index: number, value: string) => {
    if (!value) {
      // Reset to zero if empty
      onUpdateContribution(index, {
        ...contributions[index],
        amount: 0,
      });
      return;
    }
    
    const amount = Number.parseFloat(value) || 0;
    
    onUpdateContribution(index, {
      ...contributions[index],
      amount,
    });
  };

  // Update totalCost when contributions change
  useEffect(() => {
    const newTotalCost = calculateTotalCost();
    setTotalCost(newTotalCost);
    onTotalCost(newTotalCost);
  }, [contributions]);

  // Calculate percentage in useEffect to react to amount and totalCost changes
  useEffect(() => {
    if (contributions.length === 0) return;
    if (totalCost === 0) return;

    contributions.forEach((contribution, index) => {
      // Calculate percentage with full precision first
      let percentage = totalCost > 0 ? (contribution.amount / totalCost) * 100 : 0;
      
      // Round to 2 decimal places using Math.round to avoid floating point issues
      percentage = Math.round(percentage * 100) / 100;


      onUpdateContribution(index, {
        ...contribution,
        percentage,
      });
    });
  }, [totalCost]);

  // Función para agregar una nueva contribución
  const handleAddContribution = () => {
    onAppendContribution({
      financingSourceId: filteredSources?.[0]?.financingSourceId,
      percentage: 0,
      amount: 0,
    })
  }

  return (
    <div className="space-y-4">
      {contributions.filter(f => filteredSources?.some(source => source.financingSourceId === f.financingSourceId )).map((contribution) => {
        // Find the actual index in the original contributions array
        const actualIndex = contributions.findIndex(
          cont => cont === contribution
        );
        
        // Verificar si es "No aplica"
        const isSourceNoAplica = isNoAplica(contribution.financingSourceId);

        // Initialize the display value if needed
        const displayValue = inputValues[actualIndex] !== undefined 
          ? inputValues[actualIndex] 
          : (isSourceNoAplica ? "0.00" : (contribution.amount ? contribution.amount.toString() : ""));

        return (
          <div key={actualIndex} className="flex items-start gap-4">
            {/* Columna: Fuente */}
            <div className="flex flex-col w-full max-w-xs">
              <label htmlFor={`source-${actualIndex}`} className="block text-sm font-medium mb-1">
                Fuente
              </label>
              <Select
                value={contribution.financingSourceId.toString()}
                onValueChange={(value) => handleSourceChange(actualIndex, value)}
              >
                <SelectTrigger id={`source-${actualIndex}`} className="border-primary">
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSources?.map((source) => (
                    <SelectItem key={source.financingSourceId} value={source.financingSourceId.toString()}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Columna: Monto */}
            <div className="flex flex-col w-full max-w-xs">
              <label htmlFor={`amount-${actualIndex}`} className="block text-sm font-medium mb-1">
                Monto
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        Q
                      </span>
                      <Input
                        id={`amount-${actualIndex}`}
                        type="text"
                        inputMode="decimal"
                        value={displayValue}
                        onChange={(e) => handleInputChange(actualIndex, e.target.value)}
                        className={`border-primary ${isSourceNoAplica ? "opacity-70" : ""} pl-7`}
                        disabled={isSourceNoAplica}
                        onBlur={(e) => {
                          if (!isSourceNoAplica) {
                            commitValueChange(actualIndex, e.target.value);
                            
                            // Format on blur to show with 2 decimal places
                            const formattedValue = e.target.value ? 
                              Number.parseFloat(e.target.value).toFixed(2) : 
                              "";
                            
                            setInputValues({
                              ...inputValues,
                              [actualIndex]: formattedValue
                            });
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </TooltipTrigger>
                  {isSourceNoAplica && (
                    <TooltipContent>
                      <p>No se puede ingresar un valor porque está seleccionado "No Aplica"</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Columna: Botón eliminar y porcentaje */}
            <div className="flex flex-col">
              {/* Label "vacío" para alinear con la parte superior */}
              <label className="block text-sm font-medium mb-1">&nbsp;</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveContribution(actualIndex)}
                  className="h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <X className="h-5 w-5" />
                </Button>
                <span className="text-lg font-medium text-primary">{contribution.percentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Botón para agregar una nueva contribución */}
      <Button
        type="button"
        variant="default"
        onClick={handleAddContribution}
        className="bg-primary text-white hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar aporte
      </Button>
    </div>
  )
}