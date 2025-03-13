"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Check, File, FileSpreadsheet, FileText, Plus, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { EventFinishedFormProps, EventToFinish } from "@/components/poa/finalizacion/type.eventFinished"
import { eventFinishedSchema } from "@/components/poa/finalizacion/schema.eventFinished"

// Componente para mostrar los detalles del evento seleccionado
function EventDetails({ event }: { event: EventToFinish }) {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-")
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1)).toLocaleDateString("es-ES")
  }

  return (
    <div className="mt-4 grid gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-lg font-semibold text-primary">{event.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Objetivo</p>
                <p className="font-medium">{event.objective || "No especificado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="font-medium">{event.campus?.name || "No especificado"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Responsable de ejecución</p>
                <p className="font-medium">
                  {event.responsibles?.find((r) => r.responsibleRole === "Ejecución")?.name || "No especificado"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Costo total</p>
                <p className="font-medium text-primary">Q{event.totalCost?.toFixed(2) || "0.00"}</p>
              </div>
            </div>

            {event.dates && event.dates.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fechas</p>
                <div className="grid gap-2">
                  {event.dates.map((date, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                      <div className="h-2 w-2 rounded-full bg-primary/70" />
                      <p className="text-sm">
                        {formatDate(date.startDate)} - {formatDate(date.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente para mostrar los resultados de búsqueda
function SearchResults({
  filteredEvents,
  handleEventSelect,
}: {
  filteredEvents: EventToFinish[]
  handleEventSelect: (event: EventToFinish) => void
}) {
  return (
    <ul className="mt-1 border rounded-md divide-y max-h-32 overflow-y-auto bg-card">
      {filteredEvents.map((event) => (
        <li
          key={event.eventId}
          className="p-3 text-sm hover:bg-muted/50 cursor-pointer transition-colors flex items-center gap-2"
          onClick={() => handleEventSelect(event)}
        >
          <div className="h-2 w-2 rounded-full bg-primary/70" />
          <span>{event.name}</span>
        </li>
      ))}
    </ul>
  )
}

// Componente para indicar los pasos del formulario
function StepIndicator({
  currentStep,
  onStepClick,
  errors,
}: {
  currentStep: number
  onStepClick: (step: number) => void
  errors: any
}) {
  const steps = [
    {
      number: 1,
      title: "Selección de Evento",
      fields: ["eventId", "eventName"] as const,
    },
    {
      number: 2,
      title: "Datos de Finalización",
      fields: ["completionDate", "testDocuments"] as const,
    },
  ]

  const hasStepErrors = (stepFields: readonly string[]) => {
    return stepFields.some((field) => {
      return !!errors[field]
    })
  }

  return (
    <div className="w-full mb-8">
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isStepWithError = hasStepErrors(step.fields)
          return (
            <div
              key={step.number}
              className={cn("flex flex-col items-center relative group", "cursor-pointer")}
              onClick={() => {
                onStepClick(step.number)
              }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold relative z-10 bg-background transition-colors group-hover:border-primary/70",
                  currentStep > step.number
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.number
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground",
                  isStepWithError && "border-destructive",
                )}
              >
                {isStepWithError ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium transition-colors",
                  currentStep >= step.number ? "text-primary group-hover:text-primary/70" : "text-muted-foreground",
                  isStepWithError && "text-destructive",
                )}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-full w-full h-[2px] -translate-y-1/2 transition-colors",
                    currentStep > step.number ? "bg-primary" : "bg-muted",
                  )}
                  style={{ width: "calc(100% - 2.5rem)" }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function EventFinishedForm({
  onSubmit,
  selectedEvent,
  isLoading = false,
  currentStep,
  onStepChange,
  onEventSelect,
  availableEvents,
}: EventFinishedFormProps) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState<EventToFinish[]>([])
  const [testDocuments, setTestDocuments] = useState<File[]>([])
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  // Configuración del formulario
  const form = useForm({
    resolver: zodResolver(eventFinishedSchema),
    defaultValues: {
      eventId: "",
      eventName: "",
      completionDate: new Date().toISOString().split("T")[0],
      testDocuments: [],
    },
    mode: "onChange",
  })

  const {
    formState: { errors, isValid },
  } = form

  // Filtrar eventos según la búsqueda
  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm)
    if (searchTerm.length > 0) {
      const filtered = availableEvents.filter((event) => event.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredEvents(filtered)
      setShowResults(filtered.length > 0)
    } else {
      setFilteredEvents([])
      setShowResults(false)
    }
  }

  // Seleccionar un evento
  const handleEventSelection = (event: EventToFinish) => {
    onEventSelect(event)
    form.setValue("eventId", event.eventId.toString())
    form.setValue("eventName", event.name)
    setShowResults(false)
  }

  // Limpiar la selección
  const handleClearSelection = () => {
    // onEventSelect(null)
    form.setValue("eventId", "")
    form.setValue("eventName", "")
    setQuery("")
  }

  // Manejar carga de archivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files).filter((file) => file.size <= MAX_FILE_SIZE) : []

    if (files.length !== (e.target.files?.length || 0)) {
      // Aquí se podría mostrar una notificación de archivos ignorados por tamaño
    }

    setTestDocuments((prevFiles) => [...prevFiles, ...files])
    // form.setValue("testDocuments", [...testDocuments, ...files])
  }

  // Eliminar un archivo
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...testDocuments]
    updatedFiles.splice(index, 1)
    setTestDocuments(updatedFiles)
    //  form.setValue("testDocuments", updatedFiles)
  }

  // Renderizar el contenido según el paso actual
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Selección de Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento</FormLabel>
                  <div className="relative">
                    <Input
                      placeholder="Buscar un evento..."
                      value={query}
                      onChange={(e) => {
                        handleSearch(e.target.value)
                        field.onChange(e.target.value)
                      }}
                      className={cn("pr-8", errors.eventName && "border-destructive")}
                    />
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-2">
                      {selectedEvent ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={handleClearSelection}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Search className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {showResults && filteredEvents.length > 0 && query && (
                    <SearchResults filteredEvents={filteredEvents} handleEventSelect={handleEventSelection} />
                  )}
                  <FormDescription>Busque y seleccione el evento que desea marcar como finalizado</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedEvent && <EventDetails event={selectedEvent} />}
          </CardContent>
        </Card>
      )
    } else if (currentStep === 2) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Datos de Finalización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Finalización</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className={cn(errors.completionDate && "border-destructive")} />
                    </FormControl>
                    <FormDescription>Seleccione la fecha en que se finalizó el evento</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Documentos de Prueba</CardTitle>
              <FormDescription>
                Suba los documentos que respaldan la finalización del evento (máximo 10MB por archivo)
              </FormDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="testDocuments"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="grid w-full gap-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg px-6 py-8 text-center hover:border-primary/50 transition-colors">
                        <FormControl>
                          <Input type="file" multiple className="hidden" id="file-upload" onChange={handleFileUpload} />
                        </FormControl>
                        <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                          <div className="rounded-full bg-primary/10 p-3">
                            <Plus className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium">Haga clic para seleccionar archivos</span>
                          <span className="text-xs text-muted-foreground">o arrastre y suelte aquí</span>
                        </label>
                      </div>
                      {testDocuments.length > 0 && (
                        <div className="border rounded-lg p-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {testDocuments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="p-1">
                                    {(() => {
                                      const extension = file.name.split(".").pop()?.toLowerCase()
                                      switch (extension) {
                                        case "xlsx":
                                        case "xls":
                                          return <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />
                                        case "pdf":
                                          return <FileText className="h-3.5 w-3.5 text-red-600" />
                                        case "doc":
                                        case "docx":
                                          return <FileText className="h-3.5 w-3.5 text-blue-600" />
                                        default:
                                          return <File className="h-3.5 w-3.5 text-gray-400" />
                                      }
                                    })()}
                                  </div>
                                  <span className="text-sm font-medium truncate">{file.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="w-full">
      <StepIndicator currentStep={currentStep} onStepClick={onStepChange} errors={errors} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {renderStepContent()}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (currentStep === 1) {
                  // Cancelar
                } else {
                  onStepChange(currentStep - 1)
                }
              }}
              className="sm:w-auto"
            >
              {currentStep === 1 ? "Cancelar" : "Anterior"}
            </Button>
            {currentStep < 2 ? (
              <Button type="button" onClick={() => onStepChange(currentStep + 1)} className="sm:w-auto">
                Siguiente
              </Button>
            ) : (
              <Button type="submit" className="sm:w-auto" disabled={!isValid || isLoading}>
                {isLoading ? "Guardando..." : "Finalizar Evento"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}

