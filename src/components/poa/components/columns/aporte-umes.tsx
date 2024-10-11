'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface AporteUMES {
  fuente: string
  porcentaje: number
}

interface AporteUmesProps {
  aportes: AporteUMES[];
  onChangeAportes: (aportes: AporteUMES[]) => void;
}

const initialOptions = [
  { fuente: "Presupuesto Anual" },
  { fuente: "Presupuesto por Facultad" },
]

export function AporteUmes({ aportes, onChangeAportes }: AporteUmesProps) {
  const [options, setOptions] = useState(initialOptions)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [newOption, setNewOption] = useState("")
  const [porcentaje, setPorcentaje] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [localAportes, setLocalAportes] = useState(aportes)

  useEffect(() => {
    setLocalAportes(aportes)
  }, [aportes])

  const handleAddNewOption = () => {
    if (newOption.trim() !== "") {
      setOptions([...options, { fuente: newOption.trim() }])
      setNewOption("")
      setIsAddingNew(false)
      setSelectedOption(newOption.trim())
    }
  }

  const handleAddAporte = () => {
    if (selectedOption && porcentaje) {
      const newAportes = [...localAportes, { fuente: selectedOption, porcentaje: parseFloat(porcentaje) }]
      setLocalAportes(newAportes)
      onChangeAportes(newAportes)
      setSelectedOption(null)
      setPorcentaje("")
    }
  }

  const handleRemoveAporte = (fuente: string) => {
    const newAportes = localAportes.filter(aporte => aporte.fuente !== fuente)
    setLocalAportes(newAportes)
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
              <SelectItem key={option.fuente} value={option.fuente}>
                {option.fuente}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Porcentaje"
          value={porcentaje}
          onChange={(e) => setPorcentaje(e.target.value)}
          className="w-24"
        />
        <Button onClick={handleAddAporte} disabled={!selectedOption || !porcentaje}>
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
        {localAportes.map(aporte => (
          <div key={aporte.fuente} className="flex items-center justify-between bg-green-100 p-2 rounded-md">
            <span className="text-green-800">{aporte.fuente}: {aporte.porcentaje}%</span>
            <Button onClick={() => handleRemoveAporte(aporte.fuente)} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}