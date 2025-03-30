"use client"

import React, { useState } from "react"
import { type FormStep } from "./useEventFinished"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, ArrowLeft, Upload, Check, FileText, X, Plus, CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { EventFinishedResponse } from "./type.eventFinished"
import { ResponseExecutedEvent } from "@/types/eventExecution.type"

interface DateInfo {
  id: number
  startDate?: string
  endDate: string
}

interface EventFinishedFormProps {
  isLoading: boolean;
  error: string | null;
  currentStep: FormStep;
  formSearchTerm: string;
  selectedEvent: ResponseExecutedEvent | null;
  selectedFinishedEvent: EventFinishedResponse | null;
  selectedDates: { eventExecutionDateId: number, endDate: string }[];
  evidenceFiles: Map<number, File[]>;
  isEditing: boolean;
  currentDateId: number | null;
  executedEvents: ResponseExecutedEvent[];
  selectEventForEvidence: (event: ResponseExecutedEvent) => void;
  selectDateForEvidence: (eventExecutionDateId: number, endDate: string) => void;
  updateDateEndDate: (eventExecutionDateId: number, endDate: string) => void;
  addFilesToDate: (eventExecutionDateId: number, files: File[]) => void;
  goToPreviousStep: () => void;
  goToNextDate: () => void;
  setFormSearchTerm: (term: string) => void;
  resetForm: () => void;
  createForm: any; // O el tipo específico si lo tienes
  updateForm: any; // O el tipo específico si lo tienes
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  openCreateForm: () => void;
}

export const EventFinishedForm: React.FC<EventFinishedFormProps> = ({
  isLoading,
  error,
  currentStep,
  formSearchTerm,
  selectedEvent,
  selectedFinishedEvent,
  selectedDates,
  evidenceFiles,
  isEditing,
  currentDateId,
  executedEvents,
  selectEventForEvidence,
  selectDateForEvidence,
  updateDateEndDate,
  addFilesToDate,
  goToPreviousStep,
  goToNextDate,
  setFormSearchTerm,
  resetForm,
  createForm,
  updateForm,
  onSubmit,
  isFormOpen,
  setIsFormOpen,
  openCreateForm
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Función para cerrar el diálogo y resetear el formulario
  const handleClose = () => {
    resetForm()
    setIsFormOpen(false)
  }

  // Función para manejar el envío exitoso
  const handleSuccessfulSubmit = async (e?: React.BaseSyntheticEvent) => {
    await onSubmit(e)
    // No cerramos el diálogo aquí, el hook se encarga de ello en el submit exitoso
  }

  // Función para formatear la fecha para mostrar
  const formatDateDisplay = (dateString: string | undefined) => {
    if (!dateString) return "Seleccionar fecha"
    
    // Usar parseISO para asegurar que se interprete correctamente la fecha ISO
    const date = parseISO(dateString)
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Renderizado de los pasos del formulario
  const renderStepIndicator = () => {
    const steps: { key: FormStep; label: string; number: number }[] = [
      { key: "searchEvent", label: "Selección de Evento", number: 1 },
      { key: "selectDates", label: "Selección de Fechas", number: 2 },
      { key: "uploadFiles", label: "Subir Evidencias", number: 3 },
    ]

    const currentStepIndex = steps.findIndex((step) => step.key === currentStep)

    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2",
                    currentStepIndex >= index
                      ? "border-[#006837] bg-[#006837] text-white"
                      : "border-gray-300 bg-white text-gray-400",
                  )}
                >
                  {step.number}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs text-center",
                    currentStepIndex >= index ? "font-medium text-[#006837]" : "text-gray-500",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-2", index < currentStepIndex ? "bg-[#006837]" : "bg-gray-300")} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  // Paso 1: Búsqueda de eventos
  const renderSearchStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          className="pl-10 w-full border-gray-300"
          value={formSearchTerm}
          onChange={(e) => setFormSearchTerm(e.target.value)}
          placeholder="Buscar evento por nombre..."
        />
      </div>

      {executedEvents.length > 0 ? (
        <div className="mt-4 max-h-[400px] overflow-y-auto pr-1">
          <h3 className="text-sm font-medium mb-2 text-gray-600">Eventos disponibles:</h3>
          <div className="space-y-2">
            {executedEvents.map((event) => (
              <div
                key={event.eventId}
                className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => selectEventForEvidence(event)}
              >
                <div className="font-medium">{event.name}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        formSearchTerm && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-2 opacity-50" />
            <p className="text-gray-500">No se encontraron eventos con ese nombre.</p>
          </div>
        )
      )}
    </div>
  )

  // Paso 2: Selección de fechas
  const renderSelectDatesStep = () => {
    const event = isEditing ? selectedFinishedEvent : selectedEvent
    if (!event) return null

    let dates: DateInfo[] = []
    if (isEditing && selectedFinishedEvent) {
      dates = selectedFinishedEvent.dates.map((date) => ({
        id: date.eventExecutionDateId,
        startDate: date.startDate,
        endDate: date.endDate,
      }))
    } else if (selectedEvent) {
      dates = selectedEvent.eventExecutionDates.map((date) => ({
        id: date.eventExecutionDateId,
        startDate: date.startDate,
        endDate: date.endDate || "",
      }))
    }

    // Marcar fechas ya seleccionadas
    const selectedDateIds = selectedDates.map((d) => d.eventExecutionDateId)

    return (
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{event.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isEditing ? "Editando evento finalizado" : "Finalizando evento ejecutado"}
              </p>
            </div>
          </div>
        </div>

        {selectedDates.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2 text-gray-600">Fechas seleccionadas:</h3>
            <div className="space-y-2">
              {selectedDates.map((date) => {
                const hasFiles =
                  evidenceFiles.has(date.eventExecutionDateId) &&
                  (evidenceFiles.get(date.eventExecutionDateId)?.length || 0) > 0
                return (
                  <div
                    key={date.eventExecutionDateId}
                    className="p-3 border border-gray-200 rounded-md border-l-4 border-l-[#006837]"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 mt-1">Fecha fin: {date.endDate ? formatDateDisplay(date.endDate) : "No definida"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasFiles ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            <Check className="h-3 w-3 inline mr-1" /> Archivos añadidos
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            Sin archivo(s)
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectDateForEvidence(date.eventExecutionDateId, date.endDate)}
                          className="text-[#006837] hover:text-[#005a2f] hover:bg-[#e6f4ee]"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 text-gray-600">Fechas Por Finalizar:</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {dates.map((date) => {
              const isSelected = selectedDateIds.includes(date.id)
              return (
                <div
                  key={date.id}
                  className={cn(
                    "p-3 border border-gray-200 rounded-md cursor-pointer transition-colors",
                    isSelected ? "bg-[#e6f4ee] border-[#006837]" : "hover:bg-gray-50",
                  )}
                  onClick={() => selectDateForEvidence(date.id, date.endDate || "")}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Fecha inicio:</span>
                      <div className="text-sm">{date.startDate ? formatDateDisplay(date.startDate) : "No definida"}</div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Fecha fin:</span>
                      <div className="text-sm">{date.endDate ? formatDateDisplay(date.endDate) : "No definida"}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6f4ee] text-[#006837]">
                        <Check className="h-3 w-3 mr-1" /> Seleccionada
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Paso 3: Subida de archivos
  const renderUploadFilesStep = () => {
    if (!currentDateId) return null

    const selectedDateInfo = selectedDates.find((date) => date.eventExecutionDateId === currentDateId)

    if (!selectedDateInfo) return null

    const currentFiles = evidenceFiles.get(currentDateId) || []

    return (
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mt-1">Agregue la fecha de finalización y los archivos de evidencia</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Fecha de finalización</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDateInfo.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateInfo.endDate
                    ? formatDateDisplay(selectedDateInfo.endDate)
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  locale={es}
                  selected={selectedDateInfo.endDate ? parseISO(selectedDateInfo.endDate) : undefined}
                  onSelect={(date) => {
                    if (date && currentDateId !== null) {
                      updateDateEndDate(currentDateId, date.toISOString())
                    }
                    setIsDatePickerOpen(false)
                  }}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear()} 
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Archivos de evidencia {isEditing ? "(opcional)" : "(al menos uno es requerido)"}
            </label>
            <div className="border border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">Arrastre archivos aquí o haga clic para seleccionar</p>
              <Input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (currentDateId !== null) {
                    const files = Array.from(e.target.files || [])
                    addFilesToDate(currentDateId, files)
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Seleccionar archivos
              </Button>
            </div>

            {currentFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Archivos seleccionados:</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {currentFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Renderizado condicional según el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case "searchEvent":
        return renderSearchStep()
      case "selectDates":
        return renderSelectDatesStep()
      case "uploadFiles":
        return renderUploadFilesStep()
      default:
        return null
    }
  }

  // Renderizado de los botones de navegación
  const renderNavButtons = () => {
    if (currentStep === "searchEvent") {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleClose} className="text-gray-600 hover:text-gray-800">
            Cancelar
          </Button>
        </div>
      )
    }

    if (currentStep === "selectDates") {
      return (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>

          {selectedDates.length > 0 && (
            <Button
              onClick={handleSuccessfulSubmit}
              disabled={isLoading}
              className="flex items-center gap-1 bg-[#006837] hover:bg-[#005a2f] text-white"
            >
              <Check className="h-4 w-4" />
              {isLoading ? "Procesando..." : "Finalizar todas las fechas"}
            </Button>
          )}
        </div>
      )
    }

    if (currentStep === "uploadFiles") {
      const selectedDateInfo = selectedDates.find((date) => date.eventExecutionDateId === currentDateId)
      const currentFiles = currentDateId !== null ? (evidenceFiles.get(currentDateId) || []) : []
      // Si estamos en modo de edición, permitir continuar si hay fecha fin, incluso sin archivos nuevos
      const canSubmit = isEditing 
        ? selectedDateInfo?.endDate && !isLoading
        : selectedDateInfo?.endDate && currentFiles.length > 0 && !isLoading

      return (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            className="flex items-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a fechas
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={goToNextDate}
              disabled={!selectedDateInfo?.endDate}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Guardar y añadir otra fecha
            </Button>

            <Button
              onClick={handleSuccessfulSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-1 bg-[#006837] hover:bg-[#005a2f] text-white"
            >
              <Check className="h-4 w-4" />
              {isLoading ? "Procesando..." : "Finalizar todas las fechas"}
            </Button>
          </div>
        </div>
      )
    }
  }

  // Renderizado del mensaje de error
  const renderError = () => {
    if (!error) return null

    return (
      <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2 mt-4">
        <X className="h-4 w-4" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <>
      <Button
        id="open-form-button"
        onClick={openCreateForm}
        className="bg-[#006837] hover:bg-[#005a2f] text-white flex items-center gap-2"
      >
        <Plus className="h-5 w-5" /> Marcar como Completado
      </Button>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Seguimiento de Evento POA</DialogTitle>
          </DialogHeader>

          {renderStepIndicator()}

          <div className="py-2">
            {renderStep()}
            {renderError()}
          </div>

          <DialogFooter>{renderNavButtons()}</DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

