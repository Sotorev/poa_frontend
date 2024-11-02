// src/components/poa/components/columns/actividad-proyecto-selector.tsx
'use client';

import * as React from "react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DatePair {
  start: Date;
  end: Date;
}

interface ActividadProyectoSelectorProps {
  selectedOption: "actividad" | "proyecto";
  onSelectOption: (tipo: "actividad" | "proyecto") => void;
  fechas: DatePair[]; // Para actividades (múltiples fechas)
  onChangeFechas: (fechas: DatePair[]) => void;
  fechaProyecto: DatePair; // Para proyectos (una sola fecha)
  onChangeFechaProyecto: (fecha: DatePair) => void;
}

export function ActividadProyectoSelector({
  selectedOption,
  onSelectOption,
  fechas,
  onChangeFechas,
  fechaProyecto,
  onChangeFechaProyecto,
}: ActividadProyectoSelectorProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedOption}
        onValueChange={(value) => onSelectOption(value as "actividad" | "proyecto")}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="actividad" id="actividad" className="border-green-500 text-green-600" />
          <Label htmlFor="actividad" className="text-green-700">
            Actividad
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="proyecto" id="proyecto" className="border-green-500 text-green-600" />
          <Label htmlFor="proyecto" className="text-green-700">
            Proyecto
          </Label>
        </div>
      </RadioGroup>

      <div className="space-y-2">
        {selectedOption === "actividad" ? (
          <>
            {fechas.map((datePair, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={format(datePair.start, "yyyy-MM-dd")}
                  className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      const newFechas = [...fechas];
                      newFechas[index] = { ...newFechas[index], start: date };
                      onChangeFechas(newFechas);
                    }
                  }}
                />
                <span className="text-green-700">-</span>
                <Input
                  type="date"
                  value={format(datePair.end, "yyyy-MM-dd")}
                  className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      const newFechas = [...fechas];
                      newFechas[index] = { ...newFechas[index], end: date };
                      onChangeFechas(newFechas);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFechas = fechas.filter((_, i) => i !== index);
                    onChangeFechas(newFechas);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChangeFechas([...fechas, { start: new Date(), end: new Date() }]);
              }}
            >
              Añadir Fecha
            </Button>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={format(fechaProyecto.start, "yyyy-MM-dd")}
              className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  onChangeFechaProyecto({ ...fechaProyecto, start: date });
                }
              }}
            />
            <span className="text-green-700">-</span>
            <Input
              type="date"
              value={format(fechaProyecto.end, "yyyy-MM-dd")}
              className="w-auto max-w-[150px] border-green-300 text-green-700 focus:ring-green-500 text-sm px-2 py-1"
              onChange={(e) => {
                const date = new Date(e.target.value);
                if (!isNaN(date.getTime())) {
                  onChangeFechaProyecto({ ...fechaProyecto, end: date });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
