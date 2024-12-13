'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { X, Search, Plus, Trash } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { cn } from "@/lib/utils"

import { ApiEvent } from '@/types/interfaces'
import { formSchema, FormValues } from '@/schemas/poa-event-tracking-schema'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type PoaEventTrackingFormProps = {
  events: ApiEvent[];
  onSubmit: (data: FormValues) => void;
  initialData?: FormValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PoaEventTrackingForm({ events, onSubmit, initialData, open, onOpenChange }: PoaEventTrackingFormProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState<ApiEvent[]>([])
  const [archivosGastos, setArchivosGastos] = useState<File[]>([])
  const [costoTotal, setCostoTotal] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      eventId: "",
      eventName: "",
      executionResponsible: "",
      campus: "",
      aportesUmes: [{ tipo: "", monto: "" }],
      aportesOtros: [{ tipo: "", monto: "" }],
      archivosGastos: [],
      fechas: [{ fecha: new Date().toISOString().split('T')[0] }],
    },
  })

  const { fields: fechasFields, append: appendFecha, remove: removeFecha } = useFieldArray({
    control: form.control,
    name: "fechas",
  })

  const { fields: aportesUmesFields, append: appendAporteUmes, remove: removeAporteUmes } = useFieldArray({
    control: form.control,
    name: "aportesUmes",
  })

  const { fields: aportesOtrosFields, append: appendAporteOtros, remove: removeAporteOtros } = useFieldArray({
    control: form.control,
    name: "aportesOtros",
  })

  const aportesUmes = useWatch({ control: form.control, name: "aportesUmes" });
  const aportesOtros = useWatch({ control: form.control, name: "aportesOtros" });

  useEffect(() => {
    const total = [...aportesUmes, ...aportesOtros].reduce((sum, aporte) => {
      const monto = parseFloat(aporte.monto) || 0;
      return sum + monto;
    }, 0);
    setCostoTotal(total);
  }, [aportesUmes, aportesOtros]);

  const resetForm = () => {
    setSelectedEvent(null);
    form.reset({
      eventId: "",
      eventName: "",
      executionResponsible: "",
      campus: "",
      aportesUmes: [{ tipo: "", monto: "" }],
      aportesOtros: [{ tipo: "", monto: "" }],
      archivosGastos: [],
      fechas: [{ fecha: new Date().toISOString().split('T')[0] }],
    });
    setQuery('');
    setShowResults(false);
    setArchivosGastos([]);
    setCostoTotal(0);
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
        setQuery(initialData.eventName || '');
        setArchivosGastos(initialData.archivosGastos || []);
        if (initialData.eventId) {
          const initEvent = events.find(e => e.eventId.toString() === initialData.eventId);
          if (initEvent) {
            setSelectedEvent(initEvent);
            setShowResults(false);
          }
        }
      } 
      // Importante: Ya no hacemos resetForm aquí si no hay initialData.
      // De esta forma no se pierden los datos al cambiar de pestaña.
    }
  }, [open, initialData, form, events]);

  useEffect(() => {
    if (events && query.length > 0 && !selectedEvent) {
      const filtered = events.filter((event) =>
        event.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredEvents(filtered);
      setShowResults(filtered.length > 0);
    } else {
      setFilteredEvents([]);
      setShowResults(false);
    }
  }, [query, events, selectedEvent]);

  function handleSubmit(values: FormValues) {
    onSubmit(values);
    onOpenChange(false);
    // Después de enviar, reseteamos el formulario
    resetForm();
  }

  const handleEventSelect = (event: ApiEvent) => {
    setSelectedEvent(event);
    form.setValue('eventId', event.eventId.toString());
    form.setValue('eventName', event.name);

    const executionResponsible = event.responsibles.find(r => r.responsibleRole === 'Ejecución');
    form.setValue('executionResponsible', executionResponsible ? executionResponsible.name : 'No especificado');
    form.setValue('campus', event.campus.name);

    setShowResults(false);
  };

  const handleClearSelection = () => {
    setSelectedEvent(null);
    setQuery('');
    resetForm();
    setShowResults(false);
  };

  const formatDecimal = (value: string) => {
    let formatted = value.replace(/[^\d.]/g, '');
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      formatted = parts[0] + '.' + parts[1].slice(0, 2);
    }
    return formatted;
  };

  const renderAporteFields = (
    fields: Record<"id", string>[],
    name: "aportesUmes" | "aportesOtros",
    append: (value: { tipo: string, monto: string }) => void,
    remove: (index: number) => void
  ) => {
    return (
      <div className="space-y-4">
        <h4 className="text-md font-semibold">
          {name === "aportesUmes" ? "Detalles de Aporte UMES" : "Detalles de Aporte Otros"}
        </h4>
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-end">
            <FormField
              control={form.control}
              name={`${name}.${index}.tipo`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{index === 0 ? `Tipo de Aporte ${name === "aportesUmes" ? "UMES" : "Otros"}` : ""}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de aporte" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monetario">Monetario</SelectItem>
                      <SelectItem value="especie">Especie</SelectItem>
                      {name === "aportesOtros" && (
                        <>
                          <SelectItem value="donacion">Donación</SelectItem>
                          <SelectItem value="patrocinio">Patrocinio</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${name}.${index}.monto`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{index === 0 ? "Monto" : ""}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        const formattedValue = formatDecimal(e.target.value);
                        field.onChange(formattedValue);
                      }}
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
              onClick={() => remove(index)}
              className="shrink-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ tipo: "", monto: "" })}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Aporte {name === "aportesUmes" ? "UMES" : "Otros"}
        </Button>
      </div>
    )
  }

  const handleCloseForm = () => {
    onOpenChange(false);
    resetForm();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Cierra el formulario y resetea
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Sección 1: Buscar y seleccionar evento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Selección de Evento</h3>
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
                            setSelectedEvent(null);
                            form.setValue('eventId', "");
                            form.setValue('executionResponsible', "");
                            form.setValue('campus', "");
                          }
                        }}
                        className="pr-8"
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
            </div>

            {/* Información del evento seleccionado */}
            {selectedEvent && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h4 className="text-lg font-semibold mb-2">Evento Seleccionado</h4>
                <p><strong>Nombre:</strong> {selectedEvent.name}</p>
                <p><strong>Responsable de Ejecución:</strong> {form.watch('executionResponsible')}</p>
                <p><strong>Campus:</strong> {selectedEvent.campus.name}</p>
              </div>
            )}

            {/* Sección 2: Gestión de gastos */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Gestión de Gastos</h3>
              {renderAporteFields(aportesUmesFields, "aportesUmes", appendAporteUmes, removeAporteUmes)}
              {renderAporteFields(aportesOtrosFields, "aportesOtros", appendAporteOtros, removeAporteOtros)}
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h4 className="text-lg font-semibold mb-2">Costo Total</h4>
                <p className="text-2xl font-bold">Q{costoTotal.toFixed(2)}</p>
              </div>
              <FormField
                control={form.control}
                name="archivosGastos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Archivos de Gastos</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files
                            ? Array.from(e.target.files).filter(file => file.size <= MAX_FILE_SIZE)
                            : [];
                          setArchivosGastos(prevFiles => [...prevFiles, ...files]);
                          field.onChange([...archivosGastos, ...files]);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Suba documentos relacionados con los gastos (máximo 10MB por archivo)
                    </FormDescription>
                    {archivosGastos.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {archivosGastos.map((file, index) => (
                          <li key={index} className="flex items-center justify-between text-sm">
                            <span className="truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedFiles = archivosGastos.filter((_, i) => i !== index);
                                setArchivosGastos(updatedFiles);
                                field.onChange(updatedFiles);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sección 3: Registro de fechas múltiples */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fechas de Ejecución</h3>
              {fechasFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`fechas.${index}.fecha`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className={cn(index !== 0 && "sr-only")}>
                        Fecha de Ejecución
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={field.value}
                          onChange={(e) => {
                            const date = e.target.value;
                            if (date) {
                              field.onChange(date);
                            }
                          }}
                          className="w-[280px]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeFecha(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFecha({ fecha: new Date().toISOString().split('T')[0] })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Fecha
              </Button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleCloseForm();
                }}
                className="sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="sm:w-auto"
              >
                {initialData ? 'Actualizar Seguimiento' : 'Guardar Seguimiento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
