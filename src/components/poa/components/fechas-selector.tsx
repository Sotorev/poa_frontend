'use client'

import React from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FechasSelectorProps {
  fechaInicio: Date | null
  fechaFin: Date | null
  onChangeFechaInicio: (fecha: Date | null) => void
  onChangeFechaFin: (fecha: Date | null) => void
}

export function FechasSelectorComponent({ 
  fechaInicio, 
  fechaFin, 
  onChangeFechaInicio, 
  onChangeFechaFin 
}: FechasSelectorProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="fecha-inicio">Fecha de Inicio</Label>
        <Input
          id="fecha-inicio"
          type="date"
          value={fechaInicio ? fechaInicio.toISOString().split('T')[0] : ''}
          onChange={(e) => onChangeFechaInicio(e.target.value ? new Date(e.target.value) : null)}
        />
      </div>
      <div>
        <Label htmlFor="fecha-fin">Fecha de Fin</Label>
        <Input
          id="fecha-fin"
          type="date"
          value={fechaFin ? fechaFin.toISOString().split('T')[0] : ''}
          onChange={(e) => onChangeFechaFin(e.target.value ? new Date(e.target.value) : null)}
        />
      </div>
    </div>
  )
}