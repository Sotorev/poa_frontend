"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2Icon } from "lucide-react"
import { format, parseISO, isBefore } from "date-fns"
import { es } from "date-fns/locale"

// Types
import type { DateSchema } from "../formView/schema.eventPlanningForm"

interface ActivityProjectSelectorProps {
  selectedOption: "Actividad" | "Proyecto"
  onSelectOption: (option: "Actividad" | "Proyecto") => void
  dates: DateSchema[]
  defaultDate: Date
  onReplaceDates: (dates: DateSchema[]) => void
  onAppendDate: (date: DateSchema) => void
  onChangeDate: (index: number, date: DateSchema) => void
  onRemoveDate: (index: number) => void
}

export function ActivityProjectSelector({
  selectedOption,
  onSelectOption,
  dates,
  defaultDate,
  onReplaceDates,
  onAppendDate,
  onChangeDate,
  onRemoveDate,
}: ActivityProjectSelectorProps) {
  // Estado local para manejar la fecha que se está editando actualmente
  const [currentDateIndex, setCurrentDateIndex] = useState<number | null>(null)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // Función para manejar el cambio de opción (actividad o proyecto)
  const handleOptionChange = (value: string) => {
    onSelectOption(value as "Actividad" | "Proyecto")

    // Si cambia a proyecto y hay múltiples fechas, mantener solo la primera
    if (value === "Proyecto" && dates.length > 1) {
      // Filtrar solo fechas no eliminadas
      const activeDates = dates.filter(d => !d.isDeleted)
      if (activeDates.length > 1) {
        // Si hay múltiples fechas activas, conservar solo la primera
        const updatedDates = [...dates]
        // Marcar como isDeleted=true todas excepto la primera fecha activa
        let foundFirst = false
        updatedDates.forEach((date, index) => {
          if (!date.isDeleted) {
            if (!foundFirst) {
              foundFirst = true
            } else {
              updatedDates[index] = { ...date, isDeleted: true }
            }
          }
        })
        onReplaceDates(updatedDates)
      }
    }
  }

  // Función para añadir un nuevo rango de fechas
  const handleAddDateRange = (): void => {
    // Si es modo proyecto y ya hay una fecha activa, no permitir añadir más
    if (selectedOption === "Proyecto") {
      const activeDates = dates.filter(d => !d.isDeleted)
      if (activeDates.length > 0) {
        return
      }
    }

    const newDate: DateSchema = {
      startDate: "",
      endDate: "",
    }

    onAppendDate(newDate)
    setCurrentDateIndex(dates.length)
    setIsStartDateOpen(true)
  }

  // Función para eliminar o marcar como eliminada una fecha
  const handleDeleteDateRange = (index: number) => {
    const date = dates[index]
    
    // Si la fecha tiene un ID, significa que viene de la API y solo debemos marcarla como eliminada
    if (date.eventDateId) {
      const updatedDate = { ...date, isDeleted: true }
      onChangeDate(index, updatedDate)
    } else {
      // Si es una fecha nueva (sin ID), eliminarla físicamente
      onRemoveDate(index)
    }

    if (currentDateIndex === index) {
      setCurrentDateIndex(null)
    }
  }

  // Función para actualizar una fecha de inicio
  const handleStartDateChange = (date: Date | undefined, index: number) => {
    if (date) {
      const existingDate = dates[index]
      const newDate = {
        ...existingDate,
        startDate: date.toISOString(),
      }
      onChangeDate(index, newDate)
      setIsStartDateOpen(false)

      // Si no hay fecha de fin, abrir automáticamente el selector de fecha de fin
      if (!existingDate.endDate) {
        setIsEndDateOpen(true)
      }
    }
  }

  // Función para actualizar una fecha de fin
  const handleEndDateChange = (date: Date | undefined, index: number) => {
    if (date) {
      const existingDate = dates[index]
      const newDate = {
        ...existingDate,
        endDate: date.toISOString(),
      }
      onChangeDate(index, newDate)
      setIsEndDateOpen(false)
      setCurrentDateIndex(null)
    }
  }

  // Función para formatear la fecha para mostrar
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "Seleccionar"
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: es })
  }

  // Obtener solo las fechas no eliminadas para mostrar
  const activeDates = dates.filter(date => !date.isDeleted)

  return (
    <div className="space-y-4">
      {/* Selector de Actividad/Proyecto */}
      <RadioGroup value={selectedOption} onValueChange={handleOptionChange} className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Actividad" id="Actividad" />
          <Label htmlFor="Actividad" className="text-primary font-medium">
            Actividad
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Proyecto" id="Proyecto" />
          <Label htmlFor="Proyecto" className="text-primary font-medium">
            Proyecto
          </Label>
        </div>
      </RadioGroup>

      {/* Lista de rangos de fechas */}
      <div className="space-y-3">
        {activeDates.map((dateRange, visibleIndex) => {
          // Encontrar el índice real en el array de fechas completo
          const realIndex = dates.findIndex((d, idx) => 
            !d.isDeleted && 
            dates.filter(date => !date.isDeleted).indexOf(d) === visibleIndex
          )
          
          return (
            <div key={dateRange.eventDateId || visibleIndex} className="flex items-center space-x-2">
              {/* Selector de fecha de inicio */}
              <Popover
                open={currentDateIndex === realIndex && isStartDateOpen}
                onOpenChange={(open) => {
                  if (open) {
                    setCurrentDateIndex(realIndex)
                    setIsStartDateOpen(true)
                    setIsEndDateOpen(false)
                  } else {
                    setIsStartDateOpen(false)
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(dateRange.startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={dateRange.startDate ? parseISO(dateRange.startDate) : undefined}
                    defaultMonth={dateRange.startDate ? parseISO(dateRange.startDate) : defaultDate}
                    onSelect={(date) => handleStartDateChange(date, realIndex)}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear()} 
                    toYear={new Date().getFullYear() + 10}
                  />
                </PopoverContent>
              </Popover>

              <span>-</span>

              {/* Selector de fecha de fin */}
              <Popover
                open={currentDateIndex === realIndex && isEndDateOpen}
                onOpenChange={(open) => {
                  if (open) {
                    setCurrentDateIndex(realIndex)
                    setIsEndDateOpen(true)
                    setIsStartDateOpen(false)
                  } else {
                    setIsEndDateOpen(false)
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(dateRange.endDate)}
                  </Button>
                </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={dateRange.endDate ? parseISO(dateRange.endDate) : undefined}
                    onSelect={(date) => handleEndDateChange(date, realIndex)}
                    defaultMonth={dateRange.startDate ? parseISO(dateRange.startDate) : defaultDate}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear()} 
                    toYear={new Date().getFullYear() + 10}
                    initialFocus
                    disabled={(date) => dateRange.startDate ? isBefore(date, parseISO(dateRange.startDate)) : false}
                    className="rounded-md border"
                  />
                  </PopoverContent>
              </Popover>

              {/* Botón para eliminar el rango de fechas */}
              <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteDateRange(realIndex)} className="h-8 w-8">
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Botón para añadir un nuevo rango de fechas */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddDateRange}
        disabled={selectedOption === "Proyecto" && activeDates.length > 0}
        className="mt-2"
      >
        Añadir Fecha
      </Button>
    </div>
  )
}

