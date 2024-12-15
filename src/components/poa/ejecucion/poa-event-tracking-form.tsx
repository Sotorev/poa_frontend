'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, useWatch, Path } from "react-hook-form"
import { X, Search, Plus, Trash, Check, AlertCircle } from 'lucide-react'

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { ApiEvent } from '@/types/interfaces'
import { Aporte, FormFieldPaths } from '@/types/poa-event-tracking'
import { FinancingSource } from '@/types/FinancingSource'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getFinancingSources } from '@/services/apiService'

import { formSchema, FormValues } from '@/schemas/poa-event-tracking-schema'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB


type PoaEventTrackingFormProps = {
  events: ApiEvent[];
  onSubmit: (data: FormValues) => void;
  initialData?: FormValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function StepIndicator({ currentStep, onStepClick, errors }: { 
  currentStep: number; 
  onStepClick: (step: number) => void;
  errors: Record<string, any>;
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
  ]

  const hasStepErrors = (stepFields: readonly FormFieldPaths[]) => {
    return stepFields.some(field => {
      if (field.includes('.')) {
        return !!errors[field as Path<FormValues>];
      }
      return !!errors[field];
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
                )}
              >
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

function EventDetails({ event }: { event: ApiEvent }) {
  return (
    <div className="mt-4 space-y-2">
      <p><strong>Nombre del evento:</strong> {event.name}</p>
      <p><strong>Objetivo:</strong> {event.objective}</p>
      <p><strong>Campus:</strong> {event.campus.name}</p>
      <p><strong>Responsable de ejecución:</strong> {event.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || 'No especificado'}</p>
      <p><strong>Costo total:</strong> Q{event.totalCost.toFixed(2)}</p>
      <p><strong>Fechas:</strong></p>
      <ul className="list-disc list-inside">
        {event.dates.map((date, index) => (
          <li key={index}>
            {new Date(date.startDate).toLocaleDateString()} - {new Date(date.endDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PoaEventTrackingForm({ events, onSubmit, initialData, open, onOpenChange }: PoaEventTrackingFormProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [filteredEvents, setFilteredEvents] = useState<ApiEvent[]>([])
  const [archivosGastos, setArchivosGastos] = useState<File[]>([])
  const [costoTotal, setCostoTotal] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
  const [currentStep, setCurrentStep] = useState(1)

  const user = useCurrentUser();

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
    mode: "onChange" 
  })

  const aportesUmes = useWatch({ control: form.control, name: "aportesUmes" });
  const aportesOtros = useWatch({ control: form.control, name: "aportesOtros" });

  const { toast } = useToast()
  const { formState: { errors, isValid } } = form;

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: Array<FormFieldPaths> = [];
    switch(currentStep) {
      case 1:
        fieldsToValidate = ['eventId', 'eventName', 'executionResponsible', 'campus'];
        break;
      case 2:
        const aportesUmesFields: Array<FormFieldPaths> = aportesUmes.map((_, index) => `aportesUmes.${index}.tipo` as FormFieldPaths)
          .concat(aportesUmes.map((_, index) => `aportesUmes.${index}.monto` as FormFieldPaths));
        const aportesOtrosFields: Array<FormFieldPaths> = aportesOtros.map((_, index) => `aportesOtros.${index}.tipo` as FormFieldPaths)
          .concat(aportesOtros.map((_, index) => `aportesOtros.${index}.monto` as FormFieldPaths));

        fieldsToValidate = ['aportesUmes', 'aportesOtros', ...aportesUmesFields, ...aportesOtrosFields];
        break;
      case 3:
        const fechasFields: Array<FormFieldPaths> = form.getValues("fechas").map((_, index) => `fechas.${index}.fecha` as FormFieldPaths);
        fieldsToValidate = ['fechas', ...fechasFields];
        break;
      default:
        fieldsToValidate = [];
    }

    if (fieldsToValidate.length === 0) return true;

    const stepIsValid = await form.trigger(fieldsToValidate);

    if (currentStep === 2) {
      // Validación adicional para los aportes
      const aportesUmesValid = aportesUmes.every(aporte => {
        const isNoAplica = financingSources.find(source => source.financingSourceId.toString() === aporte.tipo)?.name.toLowerCase() === 'no aplica';
        return isNoAplica || parseFloat(aporte.monto) > 0;
      });
      const aportesOtrosValid = aportesOtros.every(aporte => {
        const isNoAplica = financingSources.find(source => source.financingSourceId.toString() === aporte.tipo)?.name.toLowerCase() === 'no aplica';
        return isNoAplica || parseFloat(aporte.monto) > 0;
      });

      return stepIsValid && aportesUmesValid && aportesOtrosValid;
    }

    return stepIsValid;
  };

  const handleStepClick = async (step: number) => {
    if (step === currentStep) return;
    if (step < currentStep) {
      setCurrentStep(step);
    } else {
      const stepValid = await validateCurrentStep();
      if (stepValid) {
        setCurrentStep(step);
      } else {
        toast({
          title: "Error de validación",
          description: "Por favor complete todos los campos requeridos antes de continuar",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const total = [...aportesUmes, ...aportesOtros].reduce((sum, aporte) => {
      const monto = parseFloat(aporte.monto) || 0;
      return sum + monto;
    }, 0);
    setCostoTotal(total);
  }, [aportesUmes, aportesOtros]);

  const handleCloseForm = () => {
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
    setSelectedEvent(null);
    setQuery('');
    setShowResults(false);
    setArchivosGastos([]);
    setCostoTotal(0);
    setCurrentStep(1);
    onOpenChange(false);
  }

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
    }
  }, [open, initialData, form, events]);

  useEffect(() => {
    if (user) {
      getFinancingSources(user.token)
        .then((sources) => {
          setFinancingSources(sources);
        });
    }
  }, [user]);

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

  const goToNextStep = async () => {
    if (currentStep === 2) {
      const isStep2Valid = await form.trigger(['aportesUmes', 'aportesOtros']);
      if (!isStep2Valid) {
        toast({
          title: "Error de validación",
          description: "Por favor complete correctamente todos los campos de aportes antes de continuar",
          variant: "destructive",
        });
        return;
      }
    }

    const stepValid = await validateCurrentStep();
    if (stepValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos requeridos antes de continuar",
        variant: "destructive",
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      handleCloseForm();
    }
  };

  async function handleSubmit(values: FormValues) {
    const result = formSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        toast({
          title: "Error de validación",
          description: issue.message,
          variant: "destructive",
        });
      });
      return;
    }

    onSubmit(values);
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
    setSelectedEvent(null);
    setQuery('');
    setShowResults(false);
    setArchivosGastos([]);
    setCostoTotal(0);
    setCurrentStep(1);
    onOpenChange(false);
    toast({
      title: "Éxito",
      description: "Seguimiento guardado exitosamente",
      variant: "success",
    });
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
    if (initialData) {
      form.reset(initialData);
      setQuery(initialData.eventName || '');
      if (initialData.eventId) {
        const initEvent = events.find(e => e.eventId.toString() === initialData.eventId);
        if (initEvent) {
          setSelectedEvent(initEvent);
          setShowResults(false);
        } else {
          setSelectedEvent(null);
          setShowResults(false);
        }
      } else {
        setSelectedEvent(null);
        setShowResults(false);
      }
    } else {
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
      setSelectedEvent(null);
      setQuery('');
      setShowResults(false);
      setArchivosGastos([]);
      setCostoTotal(0);
      setCurrentStep(1);
    }
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

  const renderAporteFields = (
    fields: Record<"id", string>[],
    name: "aportesUmes" | "aportesOtros",
    append: (value: Aporte) => void,
    remove: (index: number) => void
  ) => {
    const errorMessage = errors[name]?.message as string | undefined;
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {name === "aportesUmes" ? "Detalles de Aporte UMES" : "Detalles de Aporte Otros"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors[name] && typeof errors[name] === 'object' && 'message' in errors[name] && (
            <div className="text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errors[name].message}
            </div>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-end">
              <FormField
                control={form.control}
                name={`${name}.${index}.tipo` as Path<FormValues>}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{index === 0 ? `Tipo de Aporte ${name === "aportesUmes" ? "UMES" : "Otros"}` : ""}</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const isNoAplica = financingSources.find(source => source.financingSourceId.toString() === value)?.name.toLowerCase() === 'no aplica';
                        if (isNoAplica) {
                          form.setValue(`${name}.${index}.monto` as Path<FormValues>, "0");
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={cn(errors[name]?.[index]?.tipo && "border-destructive")}>
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
                name={`${name}.${index}.monto` as Path<FormValues>}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{index === 0 ? "Monto" : ""}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                        disabled={financingSources.find(source => source.financingSourceId.toString() === form.watch(`${name}.${index}.tipo`))?.name.toLowerCase() === 'no aplica'}
                        onChange={(e) => {
                          const formattedValue = formatDecimal(e.target.value);
                          field.onChange(formattedValue);
                        }}
                        className={cn(
                          "pr-8",
                          errors[name]?.[index]?.monto && "border-destructive"
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
                          setSelectedEvent(null);
                          form.setValue('eventId', "");
                          form.setValue('executionResponsible', "");
                          form.setValue('campus', "");
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
          {renderAporteFields(aportesUmesFields, "aportesUmes", appendAporteUmes, removeAporteUmes)}
          {renderAporteFields(aportesOtrosFields, "aportesOtros", appendAporteOtros, removeAporteOtros)}
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Costo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">Q{costoTotal.toFixed(2)}</p>
            </CardContent>
          </Card>
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
                      if (files.length !== (e.target.files?.length || 0)) {
                        toast({
                          title: "Error",
                          description: "Algunos archivos exceden el tamaño máximo permitido de 10MB.",
                          variant: "destructive",
                        });
                      }
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
      )}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Fechas de Ejecución</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fechasFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`fechas.${index}.fecha` as Path<FormValues>}
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
                        className="w-full sm:w-[280px]"
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {renderStepContent()}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
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
                  disabled={!isValid}
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