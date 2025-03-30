import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getEventExecutedByPoa } from "@/services/poa/eventExecuted";
import { 
  createEvidence, 
  getEventFinished, 
  updateEvidence, 
  restoreEvidence,
  downloadEvidence
} from "./service.eventFinished";
import { 
  createEvidenceRequestSchema, 
  updateEvidenceRequestSchema, 
  restoreEvidenceRequestSchema 
} from "./schema.eventFinished";
import { 
  CreateEvidenceRequest, 
  UpdateEvidenceRequest, 
  RestoreEvidenceRequest, 
  EventFinishedResponse,
  EvidenceFile
} from "./type.eventFinished";
import { ResponseExecutedEvent } from "@/types/eventExecution.type";
import { getPoaByFacultyAndYear } from "@/services/apiService";
// Charge data
import { getFacultyByUserId } from "../eventManagement/formView/service.eventPlanningForm";

export type FormStep = 'searchEvent' | 'selectDates' | 'uploadFiles';

export const useEventFinished = () => {
  const user = useCurrentUser();
  const year = new Date().getFullYear();
  
  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formSearchTerm, setFormSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{ startDate?: string; endDate?: string }>({});
  const [executedEvents, setExecutedEvents] = useState<ResponseExecutedEvent[]>([]);
  const [finishedEvents, setFinishedEvents] = useState<EventFinishedResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ResponseExecutedEvent | null>(null);
  const [selectedFinishedEvent, setSelectedFinishedEvent] = useState<EventFinishedResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>('searchEvent');
  const [selectedDates, setSelectedDates] = useState<{ eventExecutionDateId: number, endDate: string }[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<Map<number, File[]>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [currentDateId, setCurrentDateId] = useState<number | null>(null);
  const [showEvidences, setShowEvidences] = useState<number | null>(null);
  const [popoverSticky, setPopoverSticky] = useState(false);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [poaId, setPoaId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Forms
  const createForm = useForm<CreateEvidenceRequest>({
    resolver: zodResolver(createEvidenceRequestSchema),
    defaultValues: {
      data: {
        eventId: 0,
        eventExecutionDateId: 0,
        endDate: ''
      },
      evidence: []
    }
  });

  const updateForm = useForm<UpdateEvidenceRequest>({
    resolver: zodResolver(updateEvidenceRequestSchema),
    defaultValues: {
      data: {
        eventId: 0,
        eventExecutionDateId: 0,
        endDate: ''
      },
      evidence: []
    }
  });

  const restoreForm = useForm<RestoreEvidenceRequest>({
    resolver: zodResolver(restoreEvidenceRequestSchema),
    defaultValues: {
      eventId: 0
    }
  });

  // Obtener poaId al inicio
  useEffect(() => {
    const fetchPoaId = async () => {
      if (!user?.token || !facultyId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const poa = await getPoaByFacultyAndYear(facultyId, year, user.token);
        setPoaId(poa.poaId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener el POA');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPoaId();
  }, [facultyId, year, user?.token]);

  // Cargar eventos ejecutados cuando se tenga el poaId
  useEffect(() => {
    if (poaId) {
      fetchExecutedEvents();
      fetchFinishedEvents();
    }
  }, [poaId]);

  useEffect(() => {
    if (!user?.userId) return;
    getFacultyByUserId(user.userId, user.token).then(facultyId => {
        setFacultyId(facultyId);
    });
}, [user?.userId, user?.token]);

  // Filtrado de eventos finalizados
  const filteredFinishedEvents = useMemo(() => {
    if (!Array.isArray(finishedEvents)) return [];
    
    return finishedEvents.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDateFilter = !dateFilter.startDate && !dateFilter.endDate || 
        event.dates?.some(date => {
          if (dateFilter.startDate && dateFilter.endDate) {
            return date.endDate >= dateFilter.startDate && date.endDate <= dateFilter.endDate;
          }
          if (dateFilter.startDate) {
            return date.endDate >= dateFilter.startDate;
          }
          if (dateFilter.endDate) {
            return date.endDate <= dateFilter.endDate;
          }
          return true;
        });
      
      return matchesSearch && matchesDateFilter;
    });
  }, [finishedEvents, searchTerm, dateFilter]);

  // Filtrado de eventos ejecutados
  const filteredExecutedEvents = useMemo(() => {
    if (!formSearchTerm) return [];
    if (!Array.isArray(executedEvents)) return [];
    
    return executedEvents.filter(event => 
      event.name.toLowerCase().includes(formSearchTerm.toLowerCase())
    );
  }, [executedEvents, formSearchTerm]);

  // Fetch eventos ejecutados
  const fetchExecutedEvents = async () => {
    if (!poaId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEventExecutedByPoa(poaId);
      setExecutedEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos ejecutados');
      setExecutedEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch eventos finalizados
  const fetchFinishedEvents = async () => {
    if (!user?.token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEventFinished(user.token);
      setFinishedEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos finalizados');
      setFinishedEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Seleccionar evento para crear evidencia
  const selectEventForEvidence = (event: ResponseExecutedEvent) => {
    setSelectedEvent(event);
    setSelectedFinishedEvent(null);
    setIsEditing(false);
    setCurrentStep('selectDates');
    createForm.reset({
      data: {
        eventId: event.eventId,
        eventExecutionDateId: 0,
        endDate: ''
      },
      evidence: []
    });
    setSelectedDates([]);
    setEvidenceFiles(new Map());
    setCurrentDateId(null);
    setIsFormOpen(true);
  };

  // Función para seleccionar un evento para editar
  const selectEventForEdit = (event: EventFinishedResponse) => {
    // Limpiar estados previos
    setSelectedEvent(null);
    setSelectedDates([]);
    setEvidenceFiles(new Map());
    
    // Establecer el evento seleccionado
    setSelectedFinishedEvent(event);
    
    // Seleccionar todas las fechas del evento para editar
    if (event.dates && event.dates.length > 0) {
      const selectedDatesArray = event.dates.map((date) => ({
        eventExecutionDateId: date.eventExecutionDateId,
        endDate: date.endDate,
      }));
      setSelectedDates(selectedDatesArray);
      
      // Inicializar el mapa de archivos de evidencia
      const filesMap = new Map<number, File[]>();
      
      event.dates.forEach((date) => {
        // Verificar si la fecha tiene evidencias (archivos)
        if (date.evidenceFiles && date.evidenceFiles.length > 0) {
          // Marcamos que hay evidencias existentes con un array vacío
          // (los archivos existentes se mantienen en el servidor)
          filesMap.set(date.eventExecutionDateId, []);
        }
      });
      
      setEvidenceFiles(filesMap);
    }
    
    // Configurar el formulario para edición
    updateForm.reset({
      data: {
        eventId: event.eventId,
        eventExecutionDateId: 0,
        endDate: ''
      },
      evidence: []
    });
    
    // Establecer que estamos en modo edición y cambiar al paso 2
    setIsEditing(true);
    setCurrentStep("selectDates");
    setIsFormOpen(true);
  };

  // Seleccionar fecha para evidencia y pasar al paso de archivos
  const selectDateForEvidence = (eventExecutionDateId: number, endDate: string = '') => {
    setCurrentDateId(eventExecutionDateId);
    
    // Verificar si la fecha ya fue seleccionada
    const existingDateIndex = selectedDates.findIndex(
      date => date.eventExecutionDateId === eventExecutionDateId
    );
    
    // Si no existe, añadirla a las fechas seleccionadas
    if (existingDateIndex === -1) {
      setSelectedDates(prev => [...prev, { eventExecutionDateId, endDate }]);
    }
    
    // Configurar el formulario activo
    if (isEditing) {
      updateForm.setValue('data.eventExecutionDateId', eventExecutionDateId);
      updateForm.setValue('data.endDate', endDate);
    } else {
      createForm.setValue('data.eventExecutionDateId', eventExecutionDateId);
      createForm.setValue('data.endDate', endDate);
    }
    
    setCurrentStep('uploadFiles');
  };

  // Actualizar la fecha fin de una fecha seleccionada
  const updateDateEndDate = (eventExecutionDateId: number, endDate: string) => {
    setSelectedDates(prev => 
      prev.map(date => 
        date.eventExecutionDateId === eventExecutionDateId 
          ? { ...date, endDate } 
          : date
      )
    );
    
    // Actualizar también el formulario activo si es la fecha actual
    if (currentDateId === eventExecutionDateId) {
      if (isEditing) {
        updateForm.setValue('data.endDate', endDate);
      } else {
        createForm.setValue('data.endDate', endDate);
      }
    }
  };

  // Añadir archivos a una fecha específica
  const addFilesToDate = (eventExecutionDateId: number, files: File[]) => {
    setEvidenceFiles(prev => {
      const newMap = new Map(prev);
      newMap.set(eventExecutionDateId, files);
      return newMap;
    });
  };

  // Retroceder en los pasos del formulario
  const goToPreviousStep = () => {
    if (currentStep === 'uploadFiles') {
      setCurrentStep('selectDates');
    } else if (currentStep === 'selectDates') {
      setCurrentStep('searchEvent');
      setSelectedEvent(null);
      setSelectedFinishedEvent(null);
    }
  };

  // Avanzar a otra fecha (permanecer en el paso de archivos)
  const goToNextDate = () => {
    // La implementación actual vuelve a la lista de fechas
    setCurrentStep('selectDates');
  };

  // Función para descargar un archivo de evidencia
  const handleDownload = async (evidenceId: number, fileName: string) => {
    if (!user?.token) return;
    
    try {
      setIsLoading(true);
      await downloadEvidence(evidenceId, fileName, user.token);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar el archivo');
      setIsLoading(false);
    }
  };

  // Crear evidencia
  const createEventEvidence: SubmitHandler<CreateEvidenceRequest> = async (formData) => {
    if (!user?.token || !selectedEvent) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar que todas las fechas tengan una fecha fin
      const invalidDates = selectedDates.filter(date => !date.endDate);
      if (invalidDates.length > 0) {
        setError('Todas las fechas deben tener una fecha de finalización');
        setIsLoading(false);
        return;
      }
      
      // Verificar que todas las fechas tengan al menos un archivo
      const datesWithoutFiles = selectedDates.filter(
        date => !evidenceFiles.has(date.eventExecutionDateId) || 
                (evidenceFiles.get(date.eventExecutionDateId)?.length || 0) === 0
      );
      
      if (datesWithoutFiles.length > 0) {
        setError('Todas las fechas deben tener al menos un archivo de evidencia');
        setIsLoading(false);
        return;
      }
      
      // Procesar cada fecha seleccionada
      for (const dateInfo of selectedDates) {
        const files = evidenceFiles.get(dateInfo.eventExecutionDateId) || [];
        
        const evidenceData: CreateEvidenceRequest = {
          data: {
            eventId: selectedEvent.eventId,
            eventExecutionDateId: dateInfo.eventExecutionDateId,
            endDate: dateInfo.endDate
          },
          evidence: files
        };
        
        await createEvidence(evidenceData, user.token);
      }
      
      // Refrescar datos y cerrar formulario
      await fetchFinishedEvents();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear evidencia');
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar evidencia
  const updateEventEvidence: SubmitHandler<UpdateEvidenceRequest> = async (formData) => {
    if (!user?.token || !selectedFinishedEvent) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar que todas las fechas tengan una fecha fin
      const invalidDates = selectedDates.filter(date => !date.endDate);
      if (invalidDates.length > 0) {
        setError('Todas las fechas deben tener una fecha de finalización');
        setIsLoading(false);
        return;
      }
      
      // Solo verificar que las fechas con nuevos archivos tengan archivos
      const datesWithoutFiles = selectedDates.filter(
        date => {
          // Solo consideramos un problema si la fecha tiene archivos nuevos pero están vacíos
          const hasFiles = evidenceFiles.has(date.eventExecutionDateId);
          if (!hasFiles) return false; // Si no tiene archivos nuevos, está bien
          
          // Si tiene archivos nuevos pero están vacíos, es un problema
          return (evidenceFiles.get(date.eventExecutionDateId)?.length || 0) === 0;
        }
      );
      
      if (datesWithoutFiles.length > 0) {
        setError('Todas las fechas modificadas deben tener al menos un archivo de evidencia');
        setIsLoading(false);
        return;
      }
      
      // Procesar solo las fechas que tienen nuevos archivos
      const modifiedDates = selectedDates.filter(date => evidenceFiles.has(date.eventExecutionDateId));
      
      for (const dateInfo of modifiedDates) {
        const files = evidenceFiles.get(dateInfo.eventExecutionDateId) || [];
        
        const evidenceData: UpdateEvidenceRequest = {
          data: {
            eventId: selectedFinishedEvent.eventId,
            eventExecutionDateId: dateInfo.eventExecutionDateId,
            endDate: dateInfo.endDate
          },
          evidence: files
        };
        
        await updateEvidence(evidenceData, user.token);
      }
      
      // Refrescar datos y cerrar formulario
      await fetchFinishedEvents();
      resetForm();
      setIsFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar evidencia');
    } finally {
      setIsLoading(false);
    }
  };

  // Restaurar evidencia
  const restoreEventEvidence = async (eventId: number) => {
    if (!user?.token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await restoreEvidence({ eventId }, user.token);
      
      // Actualizar listas
      await fetchExecutedEvents();
      await fetchFinishedEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restaurar evidencia');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset formulario
  const resetForm = () => {
    createForm.reset();
    updateForm.reset();
    restoreForm.reset();
    setSelectedEvent(null);
    setSelectedFinishedEvent(null);
    setSelectedDates([]);
    setEvidenceFiles(new Map());
    setIsEditing(false);
    setCurrentDateId(null);
    setCurrentStep('searchEvent');
  };

  // Enviar formulario según el estado (crear o actualizar)
  const onSubmitHandler = isEditing 
    ? updateForm.handleSubmit(updateEventEvidence) 
    : createForm.handleSubmit(createEventEvidence);

  // Toggle para hacer el popover de evidencias persistente
  const togglePopoverSticky = () => {
    setPopoverSticky(!popoverSticky);
  };

  // Función para abrir el diálogo para crear
  const openCreateForm = () => {
    resetForm();
    setIsEditing(false);
    setCurrentStep('searchEvent');
    setIsFormOpen(true);
  };

  // Calcular fechas pendientes para un evento
  const getPendingDatesCount = (event: EventFinishedResponse): number => {
    if (!event.dates || event.dates.length === 0) return 0;
    
    // Contar fechas sin archivos de evidencia
    return event.dates.filter(date => !date.evidenceFiles || date.evidenceFiles.length === 0).length;
  };

  return {
    // Estado
    isLoading,
    error,
    currentStep,
    searchTerm,
    formSearchTerm,
    dateFilter,
    selectedEvent,
    selectedFinishedEvent,
    selectedDates,
    evidenceFiles,
    isEditing,
    currentDateId,
    showEvidences,
    popoverSticky,
    poaId,
    isFormOpen,
    
    // Datos
    executedEvents: filteredExecutedEvents,
    finishedEvents: filteredFinishedEvents,
    
    // Acciones
    setSearchTerm,
    setFormSearchTerm,
    setDateFilter,
    selectEventForEvidence,
    selectEventForEdit,
    selectDateForEvidence,
    updateDateEndDate,
    addFilesToDate,
    goToPreviousStep,
    goToNextDate,
    restoreEventEvidence,
    resetForm,
    handleDownload,
    setShowEvidences,
    togglePopoverSticky,
    setIsFormOpen,
    openCreateForm,
    getPendingDatesCount,
    
    // Formularios
    createForm,
    updateForm,
    restoreForm,
    onSubmit: onSubmitHandler
  };
};
