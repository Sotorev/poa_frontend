"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2Icon } from "lucide-react"
import { format } from "date-fns"
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
      onReplaceDates([dates[0]])
    }
  }

  // Función para añadir un nuevo rango de fechas
  const handleAddDateRange = (): void => {
    // Si es modo proyecto y ya hay una fecha, no permitir añadir más
    if (selectedOption === "Proyecto" && dates.length > 0) {
      return
    }

    const newDate: DateSchema = {
      startDate: "",
      endDate: "",
    }

    onAppendDate(newDate)
    setCurrentDateIndex(dates.length)
    setIsStartDateOpen(true)
  }

  // Función para eliminar un rango de fechas
  const handleDeleteDateRange = (index: number) => {
    onRemoveDate(index)

    if (currentDateIndex === index) {
      setCurrentDateIndex(null)
    }
  }

  // Función para actualizar una fecha de inicio
  const handleStartDateChange = (date: Date | undefined, index: number) => {

    if (date) {
      const newDates = [...dates]
      newDates[index] = {
        ...newDates[index],
        startDate: date.toISOString(),
      }
      onChangeDate(index, newDates[index])
      setIsStartDateOpen(false)

      // Si no hay fecha de fin, abrir automáticamente el selector de fecha de fin
      if (!dates[index].endDate) {
        setIsEndDateOpen(true)
      }
    }
  }

  // Función para actualizar una fecha de fin
  const handleEndDateChange = (date: Date | undefined, index: number) => {

    if (date) {
      const newDates = [...dates]
      newDates[index] = {
        ...newDates[index],
        endDate: date.toISOString(),
      }
      onChangeDate(index, newDates[index])
      setIsEndDateOpen(false)
      setCurrentDateIndex(null)
    }
  }

  // Función para formatear la fecha para mostrar
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "Seleccionar"
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

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
        {dates.map((dateRange, index) => (
          <div key={index} className="flex items-center space-x-2">
            {/* Selector de fecha de inicio */}
            <Popover
              open={currentDateIndex === index && isStartDateOpen}
              onOpenChange={(open) => {
                if (open) {
                  setCurrentDateIndex(index)
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
                  selected={dateRange.startDate ? new Date(dateRange.startDate) : undefined}
                  defaultMonth={dateRange.startDate ? new Date(dateRange.startDate) : defaultDate}
                  onSelect={(date) => handleStartDateChange(date, index)}
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
              open={currentDateIndex === index && isEndDateOpen}
              onOpenChange={(open) => {
                if (open) {
                  setCurrentDateIndex(index)
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
                  selected={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
                  onSelect={(date) => handleEndDateChange(date, index)}
                  defaultMonth={dateRange.startDate ? new Date(dateRange.startDate) : defaultDate}
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear()} 
                  toYear={new Date().getFullYear() + 10}
                  initialFocus
                  disabled={(date) => {
                  // Deshabilitar fechas anteriores a la fecha de inicio
                  if (dateRange.startDate) {
                    return date < new Date(dateRange.startDate)
                  }
                  return false
                  }}
                  className="rounded-md border"
                />
                </PopoverContent>
            </Popover>

            {/* Botón para eliminar el rango de fechas */}
            <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteDateRange(index)} className="h-8 w-8">
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Botón para añadir un nuevo rango de fechas */}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddDateRange}
        disabled={selectedOption === "Proyecto" && dates.length > 0}
        className="mt-2"
      >
        Añadir Fecha
      </Button>
    </div>
  )
}

