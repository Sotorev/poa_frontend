// src/hooks/use-poa-event-tracking-form.ts
import { useState, useEffect, FormEvent } from "react";
import { useForm, useFieldArray, Path, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// charge data
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { descargarArchivo } from "@/utils/downloadFile";

// Schemas
import { formSchema, FormValues } from "@/schemas/poa-event-tracking-schema";

// Types
import { ApiEvent } from "@/types/interfaces";
import { FinancingSource } from "@/types/FinancingSource";
import { getFinancingSources } from "@/services/apiService";
import { FormFieldPaths } from "@/types/poa-event-tracking";

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
  events: ApiEvent[],
  onSubmit: (data: FormValues) => void,
  initialData: FormValues | undefined,
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
  // Estados locales
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<ApiEvent[]>([]);
  const [archivosGastos, setArchivosGastos] = useState<File[]>([]);
  const [costoTotal, setCostoTotal] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState(1);

  const user = useCurrentUser();
  const { toast } = useToast();

  // Configuración del formulario
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
      fechas: [{ fecha: new Date().toISOString().split("T")[0] }],
    },
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
    remove: removeFecha,
  } = useFieldArray({
    control: form.control,
    name: "fechas",
  });

  const {
    fields: aportesUmesFields,
    append: appendAporteUmes,
    remove: removeAporteUmes,
  } = useFieldArray({
    control: form.control,
    name: "aportesUmes",
  });

  const {
    fields: aportesOtrosFields,
    append: appendAporteOtros,
    remove: removeAporteOtros,
  } = useFieldArray({
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
            tipo: String(item.financingSourceId),
            monto: String(item.amount),
          })) || [{ tipo: "", monto: "" }];

        form.setValue(
          field,
          mapped.length > 0 ? mapped : [{ tipo: "", monto: "" }]
        );
      };

      setAportes("aportesUmes", [1, 4, 5, 7]);
      setAportes("aportesOtros", [2, 3, 6]);

      const fetchCostFiles = async () => {
        const costFiles = await Promise.all(
          selectedEvent.costDetails.map(async (detail) => {
            return await descargarArchivo(
              `/api/fullevent/downloadEventCostDetailDocumentById/${detail.costDetailId}`,
              detail.fileName,
              user?.token
            );
          })
        ).then((files) => files.filter((file): file is File => file !== null));

        console.log("costFiles", costFiles);

        form.setValue("archivosGastos", costFiles);
        setArchivosGastos(costFiles);
      };

      fetchCostFiles();
    }
  }, [currentStep, selectedEvent, form, user?.token]);

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
    const total = [...aportesUmes, ...aportesOtros].reduce((sum, aporte) => {
      const monto = parseFloat(aporte.monto) || 0;
      return sum + monto;
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
      aportesUmes: [{ tipo: "", monto: "" }],
      aportesOtros: [{ tipo: "", monto: "" }],
      archivosGastos: [],
      fechas: [{ fecha: new Date().toISOString().split("T")[0] }],
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
    let fieldsToValidate: Array<FormFieldPaths> = [];
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
          .map((_, i) => `aportesUmes.${i}.tipo` as FormFieldPaths)
          .concat(
            aportesUmes.map(
              (_, i) => `aportesUmes.${i}.monto` as FormFieldPaths
            )
          );
        const aportesOtrosFieldsPaths: Array<FormFieldPaths> = aportesOtros
          .map((_, i) => `aportesOtros.${i}.tipo` as FormFieldPaths)
          .concat(
            aportesOtros.map(
              (_, i) => `aportesOtros.${i}.monto` as FormFieldPaths
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
        const fechasFieldsPaths: Array<FormFieldPaths> = form
          .getValues("fechas")
          .map((_, i) => `fechas.${i}.fecha` as FormFieldPaths);
        fieldsToValidate = ["fechas", ...fechasFieldsPaths];
        break;
      default:
        fieldsToValidate = [];
    }

    if (fieldsToValidate.length === 0) return true;

    const stepIsValid = await form.trigger(fieldsToValidate);

    if (currentStep === 2) {
      // Validación adicional para los aportes
      const aportesUmesValid = aportesUmes.every((aporte) => {
        const isNoAplica =
          financingSources
            .find(
              (source) => source.financingSourceId.toString() === aporte.tipo
            )
            ?.name.toLowerCase() === "no aplica";
        return isNoAplica || parseFloat(aporte.monto) > 0;
      });
      const aportesOtrosValid = aportesOtros.every((aporte) => {
        const isNoAplica =
          financingSources
            .find(
              (source) => source.financingSourceId.toString() === aporte.tipo
            )
            ?.name.toLowerCase() === "no aplica";
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
      fechas: [{ fecha: new Date().toISOString().split("T")[0] }],
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

  const handleEventSelect = (event: ApiEvent) => {
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
        aportesUmes: [{ tipo: "", monto: "" }],
        aportesOtros: [{ tipo: "", monto: "" }],
        archivosGastos: [],
        fechas: [{ fecha: new Date().toISOString().split("T")[0] }],
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
