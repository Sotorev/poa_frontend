'use client'

import * as React from "react"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { X, Plus } from "lucide-react"

interface ActividadProyectoSelectorProps {
  selectedOption: "actividad" | "proyecto";
  onSelectOption: (tipo: "actividad" | "proyecto") => void;
}

interface DatePair {
  start: Date;
  end: Date;
}

export function ActividadProyectoSelector({ selectedOption, onSelectOption }: ActividadProyectoSelectorProps) {
  const [actividadDatePairs, setActividadDatePairs] = useState<DatePair[]>([])
  const [proyectoDatePair, setProyectoDatePair] = useState<DatePair>({ start: new Date(), end: new Date() })

  const handleActividadDateSelect = (index: number, type: 'start' | 'end', date: Date) => {
    setActividadDatePairs(prev => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], [type]: date };
      return newPairs;
    });
  }

  const handleProyectoDateSelect = (type: 'start' | 'end', date: Date) => {
    setProyectoDatePair(prev => ({ ...prev, [type]: date }));
  }

  const handleAddActividadDatePair = () => {
    setActividadDatePairs(prev => [...prev, { start: new Date(), end: new Date() }]);
  }

  const handleRemoveActividadDatePair = (index: number) => {
    setActividadDatePairs(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedOption}
        onValueChange={(value) => onSelectOption(value as "actividad" | "proyecto")}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="actividad" id="actividad" className="border-green-500 text-green-600" />
          <Label htmlFor="actividad" className="text-green-700">Actividad</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="proyecto" id="proyecto" className="border-green-500 text-green-600" />
          <Label htmlFor="proyecto" className="text-green-700">Proyecto</Label>
        </div>
      </RadioGroup>

      {selectedOption === "actividad" && (
        <div className="space-y-2">
          {actividadDatePairs.map((pair, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                type="date"
                value={format(pair.start, "yyyy-MM-dd")}
                className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    handleActividadDateSelect(index, 'start', date);
                  }
                }}
              />
              <span className="text-green-700">-</span>
              <Input
                type="date"
                value={format(pair.end, "yyyy-MM-dd")}
                className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    handleActividadDateSelect(index, 'end', date);
                  }
                }}
              />
              <Button
                onClick={() => handleRemoveActividadDatePair(index)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            onClick={handleAddActividadDatePair}
            variant="outline"
            size="sm"
            className="mt-2 text-green-600 border-green-300 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar fechas
          </Button>
        </div>
      )}

      {selectedOption === "proyecto" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={format(proyectoDatePair.start, "yyyy-MM-dd")}
              className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  handleProyectoDateSelect('start', date);
                }
              }}
            />
            <span className="text-green-700">-</span>
            <Input
              type="date"
              value={format(proyectoDatePair.end, "yyyy-MM-dd")}
              className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  handleProyectoDateSelect('end', date);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}