'use client'

import * as React from "react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface TipoCompra {
  id: string
  name: string
}

const initialOptions: TipoCompra[] = [
  { id: "cotizacion", name: "Cotización" },
  { id: "compra-directa", name: "Compra Directa" },
  { id: "financiamiento", name: "Financiamiento" },
  { id: "otros", name: "Otros" },
  { id: "na", name: "NA" },
]

export function TipoDeCompraComponent() {
  const [options, setOptions] = useState(initialOptions)
  const [selectedTypes, setSelectedTypes] = useState<TipoCompra[]>([])
  const [newType, setNewType] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleAddNewType = () => {
    if (newType.trim() !== "") {
      const newId = `custom-${Date.now()}`
      const newOption = { id: newId, name: newType.trim() }
      setOptions([...options, newOption])
      setSelectedTypes([...selectedTypes, newOption])
      setNewType("")
      setIsAddingNew(false)
    }
  }

  const handleSelectType = (id: string) => {
    const selectedOption = options.find(opt => opt.id === id)
    if (selectedOption && !selectedTypes.some(type => type.id === id)) {
      setSelectedTypes([...selectedTypes, selectedOption])
    }
  }

  const handleRemoveType = (id: string) => {
    setSelectedTypes(selectedTypes.filter(type => type.id !== id))
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700">Tipo de Compra</Label>
      <div className="space-y-2 flex flex-col items-start">
        <Select onValueChange={handleSelectType}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddingNew(true)} variant="outline" className="w-64 text-sm">
          <Plus className="h-4 w-4 mr-2" /> Agregar nuevo tipo
        </Button>
      </div>
      {isAddingNew && (
        <div className="flex space-x-2">
          <Input
            placeholder="Nuevo tipo de compra"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleAddNewType}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddingNew(false)} variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTypes.map(type => (
          <div key={type.id} className="flex items-center justify-between bg-green-100 px-3 py-1 rounded-md">
            <span className="text-green-800 text-sm">{type.name}</span>
            <Button onClick={() => handleRemoveType(type.id)} variant="ghost" size="sm" className="ml-2 p-0">
              <X className="h-4 w-4 text-green-600 hover:text-green-800" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}