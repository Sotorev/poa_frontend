'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TipoCompra {
  id: string
  name: string
}

interface TipoDeCompraProps {
  selectedType: string
  onSelectType: (tipo: string) => void
}

const initialOptions: TipoCompra[] = [
  { id: "Cotización", name: "Cotización" },
  { id: "Compra directa", name: "Compra directa" },
  { id: "Financiamiento", name: "Financiamiento" },
  { id: "Otros", name: "Otros" },
  { id: "NA", name: "NA" },
]

export function TipoDeCompraComponent({ selectedType, onSelectType }: TipoDeCompraProps) {
  const [options] = useState(initialOptions)

  const handleSelectType = (id: string) => {
    onSelectType(id)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-green-700">Tipo de Compra</Label>
      <div className="space-y-2 flex flex-col items-start">
        <Select onValueChange={handleSelectType} value={selectedType}>
          <SelectTrigger className="w-64 border-green-500 focus:ring-green-500 focus:border-green-500">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem 
                key={option.id} 
                value={option.id}
                className="text-green-700 hover:bg-green-50 focus:bg-green-100"
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedType && (
        <div className="mt-2">
          <div className="inline-flex items-center justify-between bg-green-100 px-3 py-1 rounded-md">
            <span className="text-green-800 text-sm">
              {options.find(opt => opt.id === selectedType)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}