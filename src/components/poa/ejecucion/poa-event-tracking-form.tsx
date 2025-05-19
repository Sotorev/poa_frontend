// src/components/poa/ejecucion/poa-event-tracking-form.tsx

'use client'

import { AlertCircle, Check, Plus, Search, Trash, X, FileSpreadsheet, FileText, File, XIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePoaEventTrackingFormLogic } from "@/hooks/use-poa-event-tracking-form"
import { FieldErrors } from "react-hook-form"

import { FormValues, EventExecution, FormFieldPaths, eventExecutionFinancings } from '@/types/eventExecution.type';
import { downloadFile } from "@/utils/downloadFile"

/**
 * Componentes puros de UI:
 * 
 * Estos componentes no tienen lógica interna de negocio. Solo reciben props y renderizan UI.
 */

/** 
 * Indicador de pasos del formulario (UI pura).
 */
function StepIndicator({
  currentStep,
  onStepClick,
  errors,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
  errors: FieldErrors<FormValues>;
}) {
  const steps = [
    {
      number: 1,
      title: "Selección de Evento",
      fields: ['eventId', 'eventName', 'executionResponsible', 'campus'] as const
    },
    {
      number: 2,
      title: "Gestión de Gastos",
      fields: ['aportesUmes', 'aportesOtros'] as const
    },
    {
      number: 3,
      title: "Fechas de Ejecución",
      fields: ['fechas'] as const
    }
  ];

  const hasStepErrors = (stepFields: readonly FormFieldPaths[]) => {
    return stepFields.some(field => {
      return !!errors[field as keyof FormValues];
    });
  };

  return (
    <div className="w-full mb-8">
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isStepWithError = hasStepErrors(step.fields);
          return (
            <div
              key={step.number}
              className={cn(
                "flex flex-col items-center relative group",
                "cursor-pointer"
              )}
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
                  isStepWithError && "border-destructive"
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
                  currentStep >= step.number
                    ? "text-primary group-hover:text-primary/70"
                    : "text-muted-foreground",
                  isStepWithError && "text-destructive"
                )}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-5 left-full w-full h-[2px] -translate-y-1/2 transition-colors",
                    currentStep > step.number
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                  style={{ width: "calc(100% - 2.5rem)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

/** 
 * Detalles del evento seleccionado (UI pura).
 */
function parseDateString(dateString: string) {
  const [year, month, day] = dateString.split('-')
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1))
}

function EventDetails({ event }: { event: EventExecution }) {
  return (
    <div className="mt-4 grid gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-lg font-semibold text-primary">
            {event.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Objetivo</p>
                <p className="font-medium">{event.objective}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="font-medium">{event.campus.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Responsable de ejecución</p>
                <p className="font-medium">
                  {event.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || 'No especificado'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Costo total</p>
                <p className="font-medium text-primary">
                  Q{event.totalCost.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fechas</p>
              <div className="grid gap-2">
                {event.dates.map((date, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary/70" />
                    <p className="text-sm">
                      {parseDateString(date.startDate).toLocaleDateString('es-ES')} - {parseDateString(date.endDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SearchResults({ filteredEvents, handleEventSelect }: { filteredEvents: EventExecution[]; handleEventSelect: (event: EventExecution) => void }) {
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
  );
}

export { EventDetails, SearchResults };

/**
 * Componente Principal (UI + Uso del Hook):
 * 
 * Este componente importa el hook personalizado para manejar la lógica 
 * y mantiene la UI separada de la lógica. La UI se apoya en el hook para 
 * obtener estados, handlers y datos. Además, incluye los componentes puros 
 * de UI definidos arriba.
 */

type PoaEventTrackingFormProps = {
  events: EventExecution[];
  onSubmit: (data: FormValues) => void;
  initialData?: FormValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PoaEventTrackingForm({ events, onSubmit, initialData, open, onOpenChange }: PoaEventTrackingFormProps) {

  // Uso del hook personalizado con toda la lógica encapsulada
  const {
    form,
    errors,
    isValid,
    query,
    setQuery,
    showResults,
    filteredEvents,
    selectedEvent,
    setSelectedEvent,
    handleEventSelect,
    handleClearSelection,
    archivosGastos,
    setArchivosGastos,
    costoTotal,
    currentStep,
    handleStepClick,
    goToNextStep,
    goToPreviousStep,
    handleCloseForm,
    handleFormSubmit,
    fechasFields,
    appendFecha,
    updateFecha,
    removeFecha,
    aportesUmesFields,
    appendAporteUmes,
    removeAporteUmes,
    aportesOtrosFields,
    appendAporteOtros,
    removeAporteOtros,
    financingSources,
    formatDecimal,
  } = usePoaEventTrackingFormLogic(events, onSubmit, initialData, open, onOpenChange)

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const renderAporteFields = (
    fields: { id: string }[],
    name: "aportesUmes" | "aportesOtros",
    append: (value: eventExecutionFinancings) => void,
    remove: (index: number) => void,
    error: string
  ) => {
    return (
      <Card className={cn(error && "border border-destructive")}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {name === "aportesUmes" ? "Detalles de Aporte UMES" : "Detalles de Aporte Otros"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} id={`${name}-row-${index}`} className="flex flex-col sm:flex-row gap-4 items-end">
              <FormField
                control={form.control}
                name={`${name}.${index}.financingSourceId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{index === 0 ? `Tipo de Aporte ${name === "aportesUmes" ? "UMES" : "Otros"}` : ""}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const isNoAplica = financingSources.find(source => source.financingSourceId.toString() === value)?.name.toLowerCase() === 'no aplica';
                        if (isNoAplica) {
                          form.setValue(`${name}.${index}.amount`, 0);
                        }
                      }}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger className={cn(errors[name]?.[index]?.financingSourceId && "border-destructive")}>
                          <SelectValue placeholder="Seleccione el tipo de aporte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {financingSources
                          .filter(source => source.category === (name === "aportesUmes" ? "UMES" : "Otra"))
                          .map((source) => (
                            <SelectItem key={source.financingSourceId} value={source.financingSourceId.toString()}>
                              {source.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${name}.${index}.amount`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{index === 0 ? "Monto" : ""}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                        disabled={financingSources.find(source => source.financingSourceId === Number(form.watch(`${name}.${index}.financingSourceId`)))?.name.toLowerCase() === 'no aplica'}
                        onChange={(e) => {
                          const formattedValue = formatDecimal(e.target.value);
                          field.onChange(formattedValue);
                        }}
                        className={cn(
                          "pr-8",
                          errors[name]?.[index]?.amount && "border-destructive"
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  // Identificar el financiamiento que se va a eliminar
                  const currentFinancingSource = form.getValues(`${name}.${index}`);
                  console.log('Eliminando financiamiento:', currentFinancingSource);
                  
                  if (currentFinancingSource.eventExecutionFinancingId) {
                    // Si tiene ID (existe en la base de datos), marcar como eliminado y mantenerlo en el array
                    
                    // Establecer directamente isDeleted = true (en lugar de isToBeDeleted)
                    form.setValue(`${name}.${index}.isDeleted`, true);
                    console.log(`Marcando ${name}.${index} como isDeleted=true DIRECTAMENTE`);
                    
                    // También imprimir todos los valores actuales para debug
                    setTimeout(() => {
                      console.log('Valores después de marcar como eliminado:', form.getValues());
                    }, 100);
                    
                    // Ocultar la fila visualmente
                    const row = document.getElementById(`${name}-row-${index}`);
                    console.log('Elemento a ocultar:', row, `${name}-row-${index}`);
                    if (row) {
                      row.style.display = 'none';
                      row.style.opacity = '0.3';
                      row.style.backgroundColor = '#ffeeee';
                    }
                  } else {
                    // Si es un elemento nuevo (sin ID), podemos eliminarlo directamente del array
                    remove(index);
                  }
                }}
                className="shrink-0"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {error && (
            <p className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ eventId: 0, eventExecutionFinancingId: 0, financingSourceId: 0, amount: 0, percentage: 0 })}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Aporte {name === "aportesUmes" ? "UMES" : "Otros"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderStepContent = () => (
    <div className="space-y-4">
      {currentStep === 1 && (
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
                        setQuery(e.target.value);
                        field.onChange(e.target.value);
                        if (selectedEvent) {
                          form.setValue('eventId', "");
                          form.setValue('executionResponsible', "");
                          form.setValue('campus', "");
                          setSelectedEvent(null); // Permitir selección de un nuevo evento
                        }
                      }}
                      className={cn(
                        "pr-8",
                        errors.eventName && "border-destructive"
                      )}
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
                    <ul className="mt-1 border rounded-md divide-y max-h-32 overflow-y-auto">
                      {filteredEvents.map((event) => (
                        <li
                          key={event.eventId}
                          className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEventSelect(event)}
                        >
                          {event.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <FormDescription>
                    Busque y seleccione el evento al que desea dar seguimiento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedEvent && <EventDetails event={selectedEvent} />}
          </CardContent>
        </Card>
      )}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Gestión de Gastos</h3>
          {renderAporteFields(aportesUmesFields, "aportesUmes", appendAporteUmes, removeAporteUmes, errors.aportesUmes?.message || "")}
          {renderAporteFields(aportesOtrosFields, "aportesOtros", appendAporteOtros, removeAporteOtros, errors.aportesOtros?.message || "")}
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Costo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">Q{Number(costoTotal).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Archivos de Gastos</CardTitle>
              <FormDescription>
                Suba los documentos que respaldan los gastos del evento (máximo 10MB por archivo)
              </FormDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="archivosGastos"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div className="grid w-full gap-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg px-6 py-8 text-center hover:border-primary/50 transition-colors">
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => {
                              const files = e.target.files
                                ? Array.from(e.target.files).filter(file => file.size <= MAX_FILE_SIZE)
                                : [];
                              if (files.length !== (e.target.files?.length || 0)) {
                                // Aquí se podría mostrar una notificación de archivos ignorados por tamaño
                              }
                              setArchivosGastos(prevFiles => [...prevFiles, ...files]);
                              field.onChange([...archivosGastos, ...files]);
                            }}
                          />
                        </FormControl>
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center gap-2 cursor-pointer"
                        >
                          <div className="rounded-full bg-primary/10 p-3">
                            <PlusIcon className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium">
                            Haga clic para seleccionar archivos
                          </span>
                          <span className="text-xs text-muted-foreground">
                            o arrastre y suelte aquí
                          </span>
                        </label>
                      </div>
                      {archivosGastos.length > 0 && (
                        <div className="border rounded-lg p-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {archivosGastos.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="p-1">
                                    {(() => {
                                      const extension = file.name.split('.').pop()?.toLowerCase();
                                      switch (extension) {
                                        case 'xlsx':
                                        case 'xls':
                                          return <FileSpreadsheet className="h-3.5 w-3.5 text-green-600" />;
                                        case 'pdf':
                                          return <FileText className="h-3.5 w-3.5 text-red-600" />;
                                        case 'doc':
                                        case 'docx':
                                          return <FileText className="h-3.5 w-3.5 text-blue-600" />;
                                        default:
                                          return <File className="h-3.5 w-3.5 text-gray-400" />;
                                      }
                                    })()}
                                  </div>
                                  <span
                                    onClick={() => {
                                      const costDetail = selectedEvent?.costDetails?.find(
                                        c => c.fileName === file.name
                                      );
                                      if (costDetail) {
                                        downloadFile(
                                          `downloadEventCostDetailDocumentById/${costDetail.costDetailId}`,
                                          file.name
                                        );
                                      }
                                    }}
                                    className="text-sm font-medium hover:underline cursor-pointer truncate"
                                  >
                                    {file.name}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    const updatedFiles = archivosGastos.filter((_, i) => i !== index);
                                    setArchivosGastos(updatedFiles);
                                    field.onChange(updatedFiles);
                                  }}
                                >
                                  <XIcon className="h-3.5 w-3.5" />
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
      )}
      {currentStep === 3 && (
        <Card className={cn(errors.fechas && "border border-destructive")}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fechas de Ejecución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fechasFields.map((field, index) => {
              // Usar un estado local para controlar si la fecha está habilitada
              const isEnabled = field.isEnabled;

              return (
                <div key={field.id} className={`grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md ${isEnabled ? 'border-primary' : 'border-muted bg-muted/20'}`}>
                  <FormField
                    control={form.control}
                    name={`fechas.${index}.startDate`}
                    render={({ field: startDateField }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className={isEnabled ? '' : 'text-muted-foreground'}>
                          Fecha de inicio planificada
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={startDateField.value}
                            disabled={true}
                            className="w-full sm:w-[280px] bg-muted/50"
                          />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`fechas.${index}.executionStartDate`}
                    render={({ field: executionField }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className={isEnabled ? '' : 'text-muted-foreground'}>
                          Fecha de inicio de ejecución
                        </FormLabel>
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={executionField.value || form.getValues(`fechas.${index}.startDate`)}
                            onChange={(e) => executionField.onChange(e.target.value)}
                            className="w-full sm:w-[280px]"
                            disabled={!isEnabled}
                          />
                          <Button
                            name={isEnabled ? "removeFecha" : "enableFecha"}
                            type="button"
                            variant={isEnabled ? "outline" : "default"}
                            size="icon"
                            onClick={() => {
                              const updatedFechas = [...form.getValues("fechas")].find(f => f.eventDateId === field.eventDateId);
                              if (isEnabled) {
                                if (updatedFechas) {
                                  updateFecha(index, {
                                    ...updatedFechas,
                                    isEnabled: false
                                  })
                                }
                              } else if (!isEnabled) {
                                if (updatedFechas) {
                                  updateFecha(index, {
                                    ...updatedFechas,
                                    isEnabled: true
                                  })
                                }
                              }
                            }}
                          >
                            {isEnabled ? (
                              <Trash className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}
            {errors.fechas && (
              <p className="mt-2 text-sm text-destructive">
                {errors.fechas.message}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendFecha({
                eventDateId: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                executionStartDate: new Date().toISOString().split('T')[0],
                executionEndDate: null,
                reasonForChange: null,
                statusId: 1,
                isEnabled: false // Nueva fecha agregada como deshabilitada
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Fecha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCloseForm();
        } else {
          onOpenChange(isOpen);
        }
      }}
    >
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Seguimiento de Evento POA
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Complete los detalles del seguimiento del evento POA
          </DialogDescription>
        </DialogHeader>

        <StepIndicator
          currentStep={currentStep}
          onStepClick={handleStepClick}
          errors={errors}
        />

        <Form {...form}>

          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(handleFormSubmit)(); }} className="space-y-6">
            {renderStepContent()}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end </form>gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    handleCloseForm();
                  } else {
                    goToPreviousStep();
                  }
                }}
                className="sm:w-auto"
              >
                {currentStep === 1 ? 'Cancelar' : 'Anterior'}
              </Button>
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextStep();
                  }}
                  className="sm:w-auto"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="sm:w-auto"
                >
                  {initialData ? 'Actualizar Seguimiento' : 'Guardar Seguimiento'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}