'use client'

import * as React from "react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface AporteOtrasFuentes {
  id: string
  name: string
  percentage: number
}

const initialOptions = [
  { id: "estudiantes", name: "Estudiantes" },
  { id: "donacion", name: "Donación" },
]

export function AporteOtrasFuentesComponent() {
  const [options, setOptions] = useState(initialOptions)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [newOption, setNewOption] = useState("")
  const [percentage, setPercentage] = useState("")
  const [aportes, setAportes] = useState<AporteOtrasFuentes[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleAddNewOption = () => {
    if (newOption.trim() !== "") {
      const newId = `custom-${Date.now()}`
      setOptions([...options, { id: newId, name: newOption.trim() }])
      setNewOption("")
      setIsAddingNew(false)
      setSelectedOption(newId)
    }
  }

  const handleAddAporte = () => {
    if (selectedOption && percentage) {
      const option = options.find(opt => opt.id === selectedOption)
      if (option) {
        setAportes([...aportes, { id: option.id, name: option.name, percentage: parseFloat(percentage) }])
        setSelectedOption(null)
        setPercentage("")
      }
    }
  }

  const handleRemoveAporte = (id: string) => {
    setAportes(aportes.filter(aporte => aporte.id !== id))
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700">Aporte Otras Fuentes</Label>
      <div className="flex space-x-2">
        <Select value={selectedOption || ""} onValueChange={setSelectedOption}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar fuente" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Porcentaje"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          className="w-24"
        />
        <Button onClick={handleAddAporte} disabled={!selectedOption || !percentage}>
          Agregar
        </Button>
      </div>
      {isAddingNew ? (
        <div className="flex space-x-2">
          <Input
            placeholder="Nueva fuente"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
          />
          <Button onClick={handleAddNewOption}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsAddingNew(false)} variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button onClick={() => setIsAddingNew(true)} variant="outline" className="text-sm">
          <Plus className="h-4 w-4 mr-2" /> Agregar nueva fuente
        </Button>
      )}
      <div className="space-y-2">
        {aportes.map(aporte => (
          <div key={aporte.id} className="flex items-center justify-between bg-blue-100 p-2 rounded-md">
            <span className="text-blue-800">{aporte.name}: {aporte.percentage}%</span>
            <Button onClick={() => handleRemoveAporte(aporte.id)} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}