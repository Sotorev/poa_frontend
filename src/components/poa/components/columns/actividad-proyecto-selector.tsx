'use client'

import * as React from "react"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { X } from "lucide-react"

interface ActividadProyectoSelectorProps {
  selectedOption: "actividad" | "proyecto";
  onSelectOption: (tipo: "actividad" | "proyecto") => void;
}

export function ActividadProyectoSelector({ selectedOption, onSelectOption }: ActividadProyectoSelectorProps) {
  const [dates, setDates] = useState<Date[]>([])

  const handleDateSelect = (date: Date) => {
    setDates(prev => [...prev, date])
  }

  const handleRemoveDate = (dateToRemove: Date) => {
    setDates(prev => prev.filter(date => date !== dateToRemove))
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
          <div className="flex flex-wrap gap-2">
            {dates.map((date, index) => (
              <div
                key={index}
                className="flex items-center bg-green-100 text-green-800 text-xs font-semibold rounded-full px-2 py-1"
              >
                {format(date, "dd/MM", { locale: es })}
                <button
                  onClick={() => handleRemoveDate(date)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div>
            <Input
              type="date"
              className="w-auto max-w-[200px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  handleDateSelect(date);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}