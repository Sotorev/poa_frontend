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

// Nueva interfaz para almacenar archivos descargados
interface DownloadedFile extends File {
  evidenceId: number;
}

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
  const [selectedDates, setSelectedDates] = useState<{ eventDateId: number, endDate: string }[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<Map<number, File[]>>(new Map());
  const [downloadedFiles, setDownloadedFiles] = useState<Map<number, DownloadedFile[]>>(new Map());
  const [removedEvidenceIds, setRemovedEvidenceIds] = useState<Set<number>>(new Set());
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
        eventDateId: 0,
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
        eventDateId: 0,
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
    if (!user?.token || !poaId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEventFinished(poaId, user.token);
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
        eventDateId: 0,
        endDate: ''
      },
      evidence: []
    });
    setSelectedDates([]);
    setEvidenceFiles(new Map());
    setCurrentDateId(null);
    setIsFormOpen(true);
  };

  // Obtener archivo de evidencia sin descargarlo
  const getEvidenceFile = async (evidenceId: number, fileName: string): Promise<File | null> => {
    if (!user?.token) return null;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eventEvidence/evidences/${evidenceId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener el archivo de evidencia');
      }
      
      // Convertir la respuesta a blob
      const blob = await response.blob();
      
      // Crear un objeto File a partir del blob
      const fileObject = new File([blob], fileName, { type: blob.type }) as DownloadedFile;
      fileObject.evidenceId = evidenceId;
      
      return fileObject;
    } catch (err) {
      console.error('Error al obtener el archivo:', err);
      return null;
    }
  };

  // Cargar archivos de evidencia para el evento seleccionado para editar
  const loadEvidenceFiles = async (dates: EventFinishedResponse['dates']): Promise<void> => {
    if (!dates || !user?.token) return;
    
    setIsLoading(true);
    
    try {
      const filesMap = new Map<number, DownloadedFile[]>();
      
      // Iterar por cada fecha
      for (const date of dates) {
        if (date.evidenceFiles && date.evidenceFiles.length > 0) {
          const downloadedFilesArray: DownloadedFile[] = [];
          
          // Iterar por cada archivo de evidencia
          for (const evidence of date.evidenceFiles) {
            const file = await getEvidenceFile(evidence.evidenceId, evidence.fileName);
            if (file) {
              downloadedFilesArray.push(file as DownloadedFile);
            }
          }
          
          if (downloadedFilesArray.length > 0) {
            filesMap.set(date.eventDateId, downloadedFilesArray);
          }
        }
      }
      
      setDownloadedFiles(filesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar archivos de evidencia');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para seleccionar un evento para editar
  const selectEventForEdit = async (event: EventFinishedResponse) => {
    // Limpiar estados previos
    setSelectedEvent(null);
    setSelectedDates([]);
    setEvidenceFiles(new Map());
    setDownloadedFiles(new Map());
    
    // Importante: resetear el conjunto de IDs eliminados
    setRemovedEvidenceIds(new Set());
    
    // Establecer el evento seleccionado
    setSelectedFinishedEvent(event);
    
    // Seleccionar todas las fechas del evento para editar
    if (event.dates && event.dates.length > 0) {
      const selectedDatesArray = event.dates.map((date) => ({
        eventDateId: date.eventDateId,
        endDate: date.endDate,
      }));
      setSelectedDates(selectedDatesArray);
      
      // Cargar los archivos de evidencia
      await loadEvidenceFiles(event.dates);
    }
    
    // Configurar el formulario para edición
    updateForm.reset({
      data: {
        eventId: event.eventId,
        eventDateId: 0,
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
  const selectDateForEvidence = (eventDateId: number, endDate: string = '') => {
    setCurrentDateId(eventDateId);
    
    // Verificar si la fecha ya fue seleccionada
    const existingDateIndex = selectedDates.findIndex(
      date => date.eventDateId === eventDateId
    );
    
    // Si no existe, añadirla a las fechas seleccionadas
    if (existingDateIndex === -1) {
      setSelectedDates(prev => [...prev, { eventDateId, endDate }]);
    }
    
    // Si estamos en modo edición, cargar los archivos ya existentes
    if (isEditing && downloadedFiles.has(eventDateId)) {
      // Tomar los archivos descargados y ponerlos en el estado de archivos de evidencia
      const files = downloadedFiles.get(eventDateId) || [];
      // Filtrar archivos eliminados que están en removedEvidenceIds
      const filteredFiles = files.filter(file => !removedEvidenceIds.has((file as DownloadedFile).evidenceId));
      
      if (filteredFiles.length > 0) {
        setEvidenceFiles(prev => {
          const newMap = new Map(prev);
          // Convertir los DownloadedFile a File
          const regularFiles = filteredFiles.map(file => new File([file], file.name, { type: file.type }));
          newMap.set(eventDateId, regularFiles);
          return newMap;
        });
      }
    }
    
    // Configurar el formulario activo
    if (isEditing) {
      updateForm.setValue('data.eventDateId', eventDateId);
      updateForm.setValue('data.endDate', endDate);
    } else {
      createForm.setValue('data.eventDateId', eventDateId);
      createForm.setValue('data.endDate', endDate);
    }
    
    setCurrentStep('uploadFiles');
  };

  // Actualizar la fecha fin de una fecha seleccionada
  const updateDateEndDate = (eventDateId: number, endDate: string) => {
    setSelectedDates(prev => 
      prev.map(date => 
        date.eventDateId === eventDateId 
          ? { ...date, endDate } 
          : date
      )
    );
    
    // Actualizar también el formulario activo si es la fecha actual
    if (currentDateId === eventDateId) {
      if (isEditing) {
        updateForm.setValue('data.endDate', endDate);
      } else {
        createForm.setValue('data.endDate', endDate);
      }
    }
  };

  // Añadir archivos a una fecha específica
  const addFilesToDate = (eventDateId: number, files: File[]) => {
    setEvidenceFiles(prev => {
      const newMap = new Map(prev);
      // Si se proporciona un arreglo vacío y se llama a esta función,
      // significa que queremos limpiar los archivos existentes
      if (files.length === 0) {
        newMap.set(eventDateId, []);
        return newMap;
      }
      
      // Si hay archivos, los añadimos a los existentes
      const existingFiles = newMap.get(eventDateId) || [];
      newMap.set(eventDateId, [...existingFiles, ...files]);
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
        date => !evidenceFiles.has(date.eventDateId) || 
                (evidenceFiles.get(date.eventDateId)?.length || 0) === 0
      );
      
      if (datesWithoutFiles.length > 0) {
        setError('Todas las fechas deben tener al menos un archivo de evidencia');
        setIsLoading(false);
        return;
      }
      
      // Procesar cada fecha seleccionada
      for (const dateInfo of selectedDates) {
        const files = evidenceFiles.get(dateInfo.eventDateId) || [];
        
        const evidenceData: CreateEvidenceRequest = {
          data: {
            eventId: selectedEvent.eventId,
            eventDateId: dateInfo.eventDateId,
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
          const hasFiles = evidenceFiles.has(date.eventDateId);
          if (!hasFiles) return false; // Si no tiene archivos nuevos, está bien
          
          // Si tiene archivos nuevos pero están vacíos, es un problema
          return (evidenceFiles.get(date.eventDateId)?.length || 0) === 0;
        }
      );
      
      if (datesWithoutFiles.length > 0) {
        setError('Todas las fechas modificadas deben tener al menos un archivo de evidencia');
        setIsLoading(false);
        return;
      }
      
      // Procesar solo las fechas que tienen nuevos archivos
      const modifiedDates = selectedDates.filter(date => evidenceFiles.has(date.eventDateId));
      
      for (const dateInfo of modifiedDates) {
        const files = evidenceFiles.get(dateInfo.eventDateId) || [];
        
        const evidenceData: UpdateEvidenceRequest = {
          data: {
            eventId: selectedFinishedEvent.eventId,
            eventDateId: dateInfo.eventDateId,
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

    setDownloadedFiles(new Map());

    setRemovedEvidenceIds(new Set());
    
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

  // Función para eliminar un archivo existente
  const removeExistingFile = (dateId: number, evidenceId: number) => {
       
    if (!dateId || !evidenceId) return;
    
    // Actualizar el mapa de archivos descargados para eliminar el archivo
    const newDownloadedFiles = new Map(downloadedFiles);
    const files = newDownloadedFiles.get(dateId) || [];
     
    
    const updatedFiles = files.filter(file => (file as DownloadedFile).evidenceId !== evidenceId);
     
    
    if (updatedFiles.length > 0) {
      newDownloadedFiles.set(dateId, updatedFiles);
    } else {
      newDownloadedFiles.delete(dateId);
    }
    
    // Actualizar directamente con la nueva referencia para forzar un re-render
    setDownloadedFiles(newDownloadedFiles);
    
    // Crear nuevo conjunto para evidencias removidas
    const newRemovedSet = new Set(removedEvidenceIds);
    newRemovedSet.add(evidenceId);
     
    
    // Actualizar directamente con la nueva referencia
    setRemovedEvidenceIds(newRemovedSet);
    
    // También actualizamos la referencia de evidenceFiles para forzar re-render
    if (evidenceFiles.has(dateId)) {
      const newEvidenceFiles = new Map(evidenceFiles);
      const currentFiles = [...(newEvidenceFiles.get(dateId) || [])];
      newEvidenceFiles.set(dateId, currentFiles);
      setEvidenceFiles(newEvidenceFiles);
       
    }
    
     
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
    downloadedFiles,
    removedEvidenceIds,
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
    getEvidenceFile,
    setShowEvidences,
    togglePopoverSticky,
    setIsFormOpen,
    openCreateForm,
    getPendingDatesCount,
    removeExistingFile,
    setRemovedEvidenceIds,
    
    // Formularios
    createForm,
    updateForm,
    restoreForm,
    onSubmit: onSubmitHandler
  };
};
