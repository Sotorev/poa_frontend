// src/hooks/use-poa-event-tracking-form.ts
import { useState, useEffect, FormEvent, use } from "react";
import { useForm, useFieldArray, Path, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// charge data
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { descargarArchivo } from "@/utils/downloadFile";
import { getFinancingSources } from "@/services/apiService";

// Schemas
import { formSchema } from "@/schemas/poa-event-tracking-schema";

// Types
import { FormValues, EventExecution, FinancingSource, FormFieldPaths } from '@/types/eventExecution.type';


/**
 * Hook personalizado que encapsula toda la lógica y el estado del formulario de seguimiento POA.
 *
 * @param events Lista de eventos disponibles.
 * @param onSubmit Función a ejecutar al enviar el formulario con datos válidos.
 * @param initialData Datos iniciales del formulario (opcional).
 * @param open Indica si el modal está abierto.
 * @param onOpenChange Función para cambiar el estado del modal.
 *
 * @returns Objeto con todos los estados, funciones y handlers necesarios para el componente UI.
 */
export function usePoaEventTrackingFormLogic(
  events: EventExecution[],
  onSubmit: (data: FormValues) => void,
  initialData: FormValues | undefined,
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
  // Estados locales
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<EventExecution[]>([]);
  const [archivosGastos, setArchivosGastos] = useState<File[]>([]);
  const [costoTotal, setCostoTotal] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventExecution | null>(null);
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const user = useCurrentUser();
  const { toast } = useToast();

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const {
    formState: { errors, isValid },
  } = form;
  const aportesUmes = useWatch({ control: form.control, name: "aportesUmes" });
  const aportesOtros = useWatch({
    control: form.control,
    name: "aportesOtros",
  });

  const {
    fields: fechasFields,
    append: appendFecha,
    update: updateFecha,
    remove: removeFecha,
  } = useFieldArray<FormValues, "fechas", "id">({
    control: form.control,
    name: "fechas",
  });

  const {
    fields: aportesUmesFields,
    append: appendAporteUmes,
    remove: removeAporteUmes,
  } = useFieldArray<FormValues, "aportesUmes", "id">({
    control: form.control,
    name: "aportesUmes",
  });

  const {
    fields: aportesOtrosFields,
    append: appendAporteOtros,
    remove: removeAporteOtros,
  } = useFieldArray<FormValues, "aportesOtros", "id">({
    control: form.control,
    name: "aportesOtros",
  });

  // Carga las fuentes de financiamiento y los archivos de costos en el paso 2
  useEffect(() => {
    if (currentStep === 2 && selectedEvent) {
      const setAportes = (
        field: "aportesUmes" | "aportesOtros",
        ids: number[]
      ) => {
        const mapped = selectedEvent.financings
          ?.filter((item) => ids.includes(item.financingSourceId))
          .map((item) => ({
            eventExecutionFinancingId: item.eventExecutionFinancingId,
            eventId: selectedEvent.eventId,
            amount: Number(item.amount),
            percentage: item.percentage,
            financingSourceId: item.financingSourceId
          })) || [{ eventExecutionFinancingId: 0, eventId: selectedEvent.eventId, amount: 0, percentage: 0, financingSourceId: 0 }];

        form.setValue(
          field,
          mapped.length > 0 ? mapped : [{ eventExecutionFinancingId: 0, eventId: selectedEvent.eventId, amount: 0, percentage: 0, financingSourceId: 0 }]
        );
      };

      setAportes("aportesUmes", [1, 4, 5, 7]);
      setAportes("aportesOtros", [2, 3, 6]);

      const fetchCostFiles = async () => {
        const costFiles = await Promise.all(
          (selectedEvent.costDetails || []).map(async (detail) => {
            return await descargarArchivo(
              `/api/fullevent/downloadEventCostDetailDocumentById/${detail.costDetailId}`,
              detail.fileName,
              user?.token
            );
          })
        ).then((files) => files.filter((file): file is File => file !== null));

        form.setValue("archivosGastos", costFiles);
        setArchivosGastos(costFiles);
      };

      fetchCostFiles();
    }
  }, [currentStep, selectedEvent, form, user?.token]);

  useEffect(() => {
      if (currentStep === 3 && selectedEvent) {
  
        const defaultDate = {
          eventDateId: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          executionStartDate: new Date().toISOString().split('T')[0],
          executionEndDate: null,
          reasonForChange: null,
          statusId: 1,
          isEnabled: true
        };
        
        let eventDates;
        
        if (initialData && initialData.fechas && initialData.fechas.length > 0) {
          eventDates = initialData.fechas.map((fecha, index) => ({
            ...fecha,
            isEnabled: index === 0 ? true : fecha.isEnabled !== false
          }));
        } else {
          eventDates = selectedEvent.dates.map((date, index) => {
            return {
              eventDateId: (date as any).eventDateId || 0,
              startDate: date.startDate.split('T')[0],
              endDate: date.endDate.split('T')[0],
              executionStartDate: date.startDate.split('T')[0],
              executionEndDate: null,
              reasonForChange: null,
              statusId: 1,
              isEnabled: index === 0
            };
          });
        }
        
        form.setValue('fechas', eventDates.length > 0 ? eventDates : [defaultDate]);
      }
    }, [currentStep, selectedEvent, form, initialData]);

  // Carga de tipos de fuentes de financiamiento
  useEffect(() => {
    if (user) {
      getFinancingSources(user.token).then((sources) => {
        setFinancingSources(sources);
      });
    }
  }, [user]);

  // Filtrado de eventos según query
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

  // Cálculo de costo total
  useEffect(() => {
    if(!aportesUmes || !aportesOtros) return;
    const total = [...aportesUmes, ...aportesOtros].reduce((sum, aporte) => {
      const monto = parseFloat(aporte.amount?.toString() || "0");
      return sum + (isNaN(monto) ? 0 : monto);
    }, 0);
    setCostoTotal(total);
  }, [aportesUmes, aportesOtros]);

  // Reseteo del formulario al cerrar
  const handleCloseForm = () => {
    form.reset({
      eventId: "",
      eventName: "",
      executionResponsible: "",
      campus: "",
      aportesUmes: [{ eventId: undefined, amount: undefined, percentage: undefined, financingSourceId: undefined }],
      aportesOtros: [{ eventId: undefined, amount: undefined, percentage: undefined, financingSourceId: undefined }],
      archivosGastos: [],
      fechas: [{
        eventDateId: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        executionStartDate: new Date().toISOString().split('T')[0],
        executionEndDate: null,
        reasonForChange: null,
        statusId: 1,
        isEnabled: true
      }],
    });
    setSelectedEvent(null);
    setQuery("");
    setShowResults(false);
    setArchivosGastos([]);
    setCostoTotal(0);
    setCurrentStep(1);
    onOpenChange(false);
  };

  // Ajustes al abrir el diálogo
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
        setQuery(initialData.eventName || "");
        setArchivosGastos(initialData.archivosGastos || []);
        if (initialData.eventId) {
          const initEvent = events.find(
            (e) => e.eventId.toString() === initialData.eventId
          );
          if (initEvent) {
            setSelectedEvent(initEvent);
            setShowResults(false);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  // Validación por pasos
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: Array<Exclude<FormFieldPaths, undefined>> = [];
    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "eventId",
          "eventName",
          "executionResponsible",
          "campus",
        ];
        break;
      case 2:
        const aportesUmesFieldsPaths: Array<FormFieldPaths> = aportesUmes
          .map((_, i) => `aportesUmes.${i}.financingSourceId` as FormFieldPaths)
          .concat(
            aportesUmes.map(
              (_, i) => `aportesUmes.${i}.amount` as FormFieldPaths
            )
          );
        const aportesOtrosFieldsPaths: Array<FormFieldPaths> = aportesOtros
          .map((_, i) => `aportesOtros.${i}.financingSourceId` as FormFieldPaths)
          .concat(
            aportesOtros.map(
              (_, i) => `aportesOtros.${i}.amount` as FormFieldPaths
            )
          );
        fieldsToValidate = [
          "aportesUmes",
          "aportesOtros",
          ...aportesUmesFieldsPaths,
          ...aportesOtrosFieldsPaths,
        ];
        break;
      case 3:
        fieldsToValidate = ["fechas"];
        break;
    }

    if (fieldsToValidate.length === 0) return true;

    const stepIsValid = await form.trigger(fieldsToValidate);

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
          description:
            "Por favor complete todos los campos requeridos antes de continuar",
          variant: "destructive",
        });
      }
    }
  };

  const goToNextStep = async () => {
    if (currentStep === 2) {
      const isStep2Valid = await form.trigger(["aportesUmes", "aportesOtros"]);
      if (!isStep2Valid) {
        toast({
          title: "Error de validación",
          description:
            "Por favor complete correctamente todos los campos de aportes antes de continuar",
          variant: "destructive",
        });
        return;
      }
    }

    const stepValid = await validateCurrentStep();
    if (stepValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast({
        title: "Error de validación",
        description:
          "Por favor complete todos los campos requeridos antes de continuar",
        variant: "destructive",
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      handleCloseForm();
    }
  };

  async function handleFormSubmit(values: FormValues) {
    // Eliminar fechas que no están habilitadas y eliminar el campo isEnabled
    const fechasHabilitadas = values.fechas.filter((fecha) => fecha.isEnabled);
    values.fechas = fechasHabilitadas;

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
      aportesUmes: [{ eventId: undefined, amount: undefined, percentage: undefined, financingSourceId: undefined }],
      aportesOtros: [{ eventId: undefined, amount: undefined, percentage: undefined, financingSourceId: undefined }],
      archivosGastos: [],
      fechas: [{
        eventDateId: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        executionStartDate: new Date().toISOString().split('T')[0],
        executionEndDate: null,
        reasonForChange: null,
        statusId: 1,
        isEnabled: true
      }],
    });
    setSelectedEvent(null);
    setQuery("");
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

  const handleEventSelect = (event: EventExecution) => {
    setSelectedEvent(event);
    form.setValue("eventId", event.eventId.toString());
    form.setValue("eventName", event.name);

    const executionResponsible = event.responsibles.find(
      (r) => r.responsibleRole === "Ejecución"
    );
    form.setValue(
      "executionResponsible",
      executionResponsible ? executionResponsible.name : "No especificado"
    );
    form.setValue("campus", event.campus.name);

    setShowResults(false);
    setQuery(""); // Limpiar la búsqueda para permitir una nueva búsqueda
  };

  const handleClearSelection = () => {
    if (initialData) {
      form.reset(initialData);
      setQuery(initialData.eventName || "");
      if (initialData.eventId) {
        const initEvent = events.find(
          (e) => e.eventId.toString() === initialData.eventId
        );
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
        aportesUmes: [{ eventId: undefined, amount: undefined, percentage: undefined, financingSourceId: undefined }],
        aportesOtros: [{ eventId: undefined, amount: undefined, percentage: undefined, financingSourceId: undefined }],
        archivosGastos: [],
        fechas: [{
          eventDateId: 0,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          executionStartDate: new Date().toISOString().split('T')[0],
          executionEndDate: null,
          reasonForChange: null,
          statusId: 1,
          isEnabled: true
        }],
      });
      setSelectedEvent(null);
      setQuery("");
      setShowResults(false);
      setArchivosGastos([]);
      setCostoTotal(0);
      setCurrentStep(1);
    }
  };

  const formatDecimal = (value: string) => {
    let formatted = value.replace(/[^\d.]/g, "");
    const parts = formatted.split(".");
    if (parts.length > 2) {
      formatted = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts.length === 2 && parts[1].length > 2) {
      formatted = parts[0] + "." + parts[1].slice(0, 2);
    }
    return formatted;
  };

  return {
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
    open,
    onOpenChange,
  };
}