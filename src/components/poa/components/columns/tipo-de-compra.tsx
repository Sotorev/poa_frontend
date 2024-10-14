'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface TipoCompra {
  id: string
  name: string
}

interface TipoDeCompraProps {
  selectedTypes: string[]
  onSelectTypes: (tipos: string[]) => void
}

const initialOptions: TipoCompra[] = [
  { id: "Cotización", name: "Cotización" },
  { id: "Compra directa", name: "Compra directa" },
  { id: "Financiamiento", name: "Financiamiento" },
  { id: "Otros", name: "Otros" },
  { id: "NA", name: "NA" },
]

export function TipoDeCompraComponent({ selectedTypes, onSelectTypes }: TipoDeCompraProps) {
  const [options, setOptions] = useState(initialOptions)
  const [localSelectedTypes, setLocalSelectedTypes] = useState<string[]>(selectedTypes)
  const [newType, setNewType] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)

  useEffect(() => {
    setLocalSelectedTypes(selectedTypes)
  }, [selectedTypes])

  const handleAddNewType = () => {
    if (newType.trim() !== "") {
      const newOption = { id: newType.trim(), name: newType.trim() }
      setOptions([...options, newOption])
      const updatedTypes = [...localSelectedTypes, newOption.id]
      setLocalSelectedTypes(updatedTypes)
      onSelectTypes(updatedTypes)
      setNewType("")
      setIsAddingNew(false)
    }
  }

  const handleSelectType = (id: string) => {
    if (!localSelectedTypes.includes(id)) {
      const updatedTypes = [...localSelectedTypes, id]
      setLocalSelectedTypes(updatedTypes)
      onSelectTypes(updatedTypes)
    }
  }

  const handleRemoveType = (id: string) => {
    const updatedTypes = localSelectedTypes.filter(type => type !== id)
    setLocalSelectedTypes(updatedTypes)
    onSelectTypes(updatedTypes)
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
        {localSelectedTypes.map(typeId => {
          const type = options.find(opt => opt.id === typeId)
          return type ? (
            <div key={type.id} className="flex items-center justify-between bg-green-100 px-3 py-1 rounded-md">
              <span className="text-green-800 text-sm">{type.name}</span>
              <Button onClick={() => handleRemoveType(type.id)} variant="ghost" size="sm" className="ml-2 p-0">
                <X className="h-4 w-4 text-green-600 hover:text-green-800" />
              </Button>
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}
