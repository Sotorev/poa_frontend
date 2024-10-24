// src/components/poa/components/columns/actividad-proyecto-selector.tsx
'use client';

import * as React from "react"
import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

interface ActividadProyectoSelectorProps {
  selectedOption: "actividad" | "proyecto";
  onSelectOption: (tipo: "actividad" | "proyecto") => void;
  onChange: (data: {
    tipoEvento: "actividad" | "proyecto";
    fechas: DatePair[];
  }) => void;
}

interface DatePair {
  start: Date;
  end: Date;
}

export function ActividadProyectoSelector({ selectedOption, onSelectOption, onChange }: ActividadProyectoSelectorProps) {
  const [actividadDatePair, setActividadDatePair] = useState<DatePair>({ start: new Date(), end: new Date() })
  const [proyectoDatePair, setProyectoDatePair] = useState<DatePair>({ start: new Date(), end: new Date() })

  useEffect(() => {
    if (selectedOption === "actividad") {
      onChange({
        tipoEvento: "actividad",
        fechas: [actividadDatePair],
      });
    } else {
      onChange({
        tipoEvento: "proyecto",
        fechas: [proyectoDatePair],
      });
    }
  }, [selectedOption, actividadDatePair, proyectoDatePair, onChange]);

  const handleDateSelect = (type: 'start' | 'end', date: Date) => {
    if (selectedOption === "actividad") {
      setActividadDatePair(prev => ({ ...prev, [type]: date }));
    } else {
      setProyectoDatePair(prev => ({ ...prev, [type]: date }));
    }
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

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={format(selectedOption === "actividad" ? actividadDatePair.start : proyectoDatePair.start, "yyyy-MM-dd")}
            className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                handleDateSelect('start', date);
              }
            }}
          />
          <span className="text-green-700">-</span>
          <Input
            type="date"
            value={format(selectedOption === "actividad" ? actividadDatePair.end : proyectoDatePair.end, "yyyy-MM-dd")}
            className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
            onChange={(e) => {
              const date = new Date(e.target.value);
              if (!isNaN(date.getTime())) {
                handleDateSelect('end', date);
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}