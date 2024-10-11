'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface AporteUMES {
  id: string
  name: string
  percentage: number
}

interface AporteUmesProps {
  aportes: AporteUMES[];
  onChangeAportes: (aportes: AporteUMES[]) => void;
}

const initialOptions = [
  { id: "presupuesto-anual", name: "Presupuesto Anual" },
  { id: "presupuesto-facultad", name: "Presupuesto por Facultad" },
]

export function AporteUmes({ aportes, onChangeAportes }: AporteUmesProps) {
  const [options, setOptions] = useState(initialOptions)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [newOption, setNewOption] = useState("")
  const [percentage, setPercentage] = useState("")
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
        const newAportes = [...aportes, { id: option.id, name: option.name, percentage: parseFloat(percentage) }]
        onChangeAportes(newAportes)
        setSelectedOption(null)
        setPercentage("")
      }
    }
  }

  const handleRemoveAporte = (id: string) => {
    const newAportes = aportes.filter(aporte => aporte.id !== id)
    onChangeAportes(newAportes)
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700">Aporte UMES</Label>
      <div className="flex space-x-2">
        <Select value={selectedOption || ""} onValueChange={setSelectedOption}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar opción" />
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
            placeholder="Nueva opción"
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
          <Plus className="h-4 w-4 mr-2" /> Agregar nueva opción
        </Button>
      )}
      <div className="space-y-2">
        {aportes.map(aporte => (
          <div key={aporte.id} className="flex items-center justify-between bg-green-100 p-2 rounded-md">
            <span className="text-green-800">{aporte.name}: {aporte.percentage}%</span>
            <Button onClick={() => handleRemoveAporte(aporte.id)} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}