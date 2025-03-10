// src/components/poa/eventManagement/fields/financing-source.tsx
"use client"

import { useContext, useMemo, useEffect, useState } from "react"
import { EventContext } from "../formView/event.context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"


// Types
import { FinancingSourceRequest } from "../formView/eventPlanningForm.schema"


interface FinancingSourceProps {
  contributions: FinancingSourceRequest[]
  onAppendContribution: (contribution: FinancingSourceRequest) => void
  onRemoveContribution: (index: number) => void
  onUpdateContribution: (index: number, contribution: FinancingSourceRequest) => void
  onTotalCost: (totalCost: number) => void
  isUMES: boolean
}

export default function FinancingSource({
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

  // Filtrar las fuentes de financiamiento según la categoría
  const filteredSources = useMemo(() => {
    return financingSources?.filter(
      (source) => !source.isDeleted && (isUMES ? source.category === "UMES" : source.category === "Otra"),
    )
  }, [financingSources, isUMES])



  // Función para manejar el cambio de fuente de financiamiento
  const handleSourceChange = (index: number, value: string) => {
    const financingSourceId = Number.parseInt(value, 10)
    onUpdateContribution(index, {
      ...contributions[index],
      financingSourceId,
    })
  }

  const calculateTotalCost = (): number => {
    return contributions.reduce((acc, contribution) => acc + contribution.amount
      , 0)
  }

  // Función para manejar el cambio de monto
  const handleAmountChange = (index: number, value: string) => {
    const amount = Number.parseFloat(value) || 0


    // Only update the amount initially
    onUpdateContribution(index, {
      ...contributions[index],
      amount,
    })
  }

  useEffect(() => {
    setTotalCost(calculateTotalCost())
    onTotalCost(totalCost)
  }, [contributions])

  // Calculate percentage in useEffect to react to amount and totalCost changes
  useEffect(() => {
    if (contributions.length === 0) return;
    if (totalCost === 0) return;

    contributions.forEach((contribution, index) => {
      const percentage = totalCost > 0 ? (contribution.amount / totalCost) * 100 : 0;

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
              <Input
                id={`amount-${actualIndex}`}
                type="number"
                value={contribution.amount || ""}
                onChange={(e) => handleAmountChange(actualIndex, e.target.value)}
                className="border-primary"
              />
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
                <span className="text-lg font-medium">{contribution.percentage.toFixed(1)}%</span>
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