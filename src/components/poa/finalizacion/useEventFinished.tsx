"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

import type { EventFinishedResponse, EventFinishedRequest } from "@/components/poa/finalizacion/type.eventFinished"
import { ResponseExecutedEvent } from "@/types/eventExecution.type"

import { eventFinishedRequestSchema } from "@/components/poa/finalizacion/schema.eventFinished"

import {
  getAvailableEventsToFinish,
  getFinishedEvents,
  markEventAsFinished,
  updateFinishedEvent,
  revertFinishedEvent,
} from "@/components/poa/finalizacion/service.eventFinished"

import { getFacultyByUserId } from "@/services/faculty/currentFaculty"
import { getPoaByFacultyAndYear } from "@/services/apiService"

export function useEventFinishedView() {
  // Estados
  const [finishedEvents, setFinishedEvents] = useState<EventFinishedResponse[]>([])
  const [availableEvents, setAvailableEvents] = useState<ResponseExecutedEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ResponseExecutedEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<EventFinishedResponse | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEvents, setFilteredEvents] = useState<ResponseExecutedEvent[]>([])
  const [showResults, setShowResults] = useState(false)
  const [testDocuments, setTestDocuments] = useState<File[]>([])
  // Estados adicionales que estaban en UI.eventFinishedForm
  const [query, setQuery] = useState("")
  const [evidences, setEvidences] = useState<File[]>([])
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const { toast } = useToast()
  const user = useCurrentUser()

  // Configuración del formulario
  const form = useForm<EventFinishedRequest>({
    resolver: zodResolver(eventFinishedRequestSchema),
    defaultValues: {
      eventId:  0,
      endDate: [],
      evidences: [],
    },
    mode: "onChange",
  })

  const {
    formState: { errors, isValid },
  } = form

  const loadData = async () => {
    if (!user?.token) return

    setIsLoading(true)
    try {

      const facultyId = await getFacultyByUserId(user.userId, user.token)
      const poaId = (await getPoaByFacultyAndYear(facultyId, 2025,user.token)).poaId
      const [finishedEventsData, availableEventsData] = await Promise.all([
       getFinishedEvents(user.token, poaId),
        getAvailableEventsToFinish(user.token, poaId),
      ])

      setFinishedEvents(finishedEventsData)
      setAvailableEvents(availableEventsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.token) {
      loadData()
    }
  }, [user])

  // Filtrar eventos disponibles según la búsqueda
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = availableEvents.filter((event) => event.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredEvents(filtered)
      setShowResults(filtered.length > 0)
    } else {
      setFilteredEvents([])
      setShowResults(false)
    }
  }, [searchQuery, availableEvents])

  // Filtrar eventos según la búsqueda (función que estaba en UI.eventFinishedForm)
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

  // Limpiar la selección (función que estaba en UI.eventFinishedForm)
  const handleClearSelection = () => {
    form.setValue("eventId", 0)
    form.setValue("endDate", [])
    setQuery("")
  }

  // Manejar carga de archivos (función que estaba en UI.eventFinishedForm)
  const handleFileUpload = (input: React.ChangeEvent<HTMLInputElement> | File[]) => {
    let files: File[] = [];
    
    if (Array.isArray(input)) {
      // Si recibimos un array de archivos directamente
      files = input.filter(file => file.size <= MAX_FILE_SIZE);
    } else {
      // Si recibimos un evento de cambio de input
      files = input.target.files 
        ? Array.from(input.target.files).filter(file => file.size <= MAX_FILE_SIZE) 
        : [];
        
      if (files.length !== (input.target.files?.length || 0)) {
        // Aquí se podría mostrar una notificación de archivos ignorados por tamaño
      }
    }

    setEvidences(prevFiles => [...prevFiles, ...files]);
    form.setValue("evidences", [...evidences, ...files]);
  }

  // Eliminar un archivo (función que estaba en UI.eventFinishedForm)
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...evidences]
    updatedFiles.splice(index, 1)
    setEvidences(updatedFiles)
    form.setValue("evidences", updatedFiles)
  }

  // Manejar selección de evento
  const handleEventSelect = (event: ResponseExecutedEvent) => {
    setSelectedEvent(event)
    form.setValue("eventId", event.eventId)
    form.setValue("endDate", event.eventExecutionDates.map((date) => ({
      eventExecutionDateId: date.eventExecutionDateId,
      endDate: date.endDate,
    })))
    setShowResults(false)
  }

  // Manejar cambio de paso
  const handleStepChange = async (step: number) => {
    if (step === currentStep) return

    if (step > currentStep) {
      // Validar paso actual antes de avanzar
      let isStepValid = false

      if (currentStep === 1) {
        isStepValid = await form.trigger(["eventId", "endDate"])
      } else if (currentStep === 2) {
        isStepValid = await form.trigger(["evidences"])
      }

      if (!isStepValid) {
        toast({
          title: "Error de validación",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        })
        return
      }
    }

    setCurrentStep(step)
  }

  // Manejar envío del formulario
  const handleSubmit = async (data: EventFinishedRequest) => {
    if (!user?.token) return

    setIsLoading(true)
    try {

      console.log("data", data)
      console.log("estoy en el handleSubmit")
      if (editingEvent) {
        await updateFinishedEvent(editingEvent.eventId, data, user.token)
        toast({
          title: "Éxito",
          description: "Evento actualizado correctamente",
        })
      } else {
        await markEventAsFinished(data, user.token)
        toast({
          title: "Éxito",
          description: "Evento marcado como finalizado correctamente",
        })
      }

      // Recargar datos
      await loadData()

      // Cerrar diálogo y resetear formulario
      handleCloseDialog()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar edición de evento
  const handleEdit = (event: EventFinishedResponse) => {
    setEditingEvent(event)

    // Buscar el evento en la lista de disponibles para obtener detalles completos
    const fullEvent = availableEvents.find((e) => e.eventId === event.eventId) || null
    setSelectedEvent(fullEvent)

    // Establecer valores del formulario
    form.setValue("eventId", event.eventId)
    form.setValue("endDate", event.completionDate) // TODO: Cambiar a la fechas de finalización en plural

    // Los documentos de prueba no se pueden cargar directamente, se manejarán por separado
    setTestDocuments([])

    setIsDialogOpen(true)
    setCurrentStep(1)
  }

  // Manejar restauración de evento
  const handleRestore = async (eventId: number) => {
    if (!user?.token) return

    setIsLoading(true)
    try {
      await revertFinishedEvent(eventId, user.token)

      toast({
        title: "Éxito",
        description: "Evento restaurado correctamente",
      })

      // Recargar datos
      await loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restaurar el evento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar apertura del diálogo para nuevo evento
  const handleOpenDialog = () => {
    setEditingEvent(null)
    setSelectedEvent(null)
    form.reset({
      eventId: 0,
      endDate: [],
      evidences: [],
    })
    setTestDocuments([])
    setCurrentStep(1)
    setIsDialogOpen(true)
  }

  // Manejar cierre del diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEvent(null)
    setSelectedEvent(null)
    form.reset()
    setTestDocuments([])
    setCurrentStep(1)
  }

  return {
    finishedEvents,
    availableEvents,
    filteredEvents,
    isLoading,
    isDialogOpen,
    selectedEvent,
    currentStep,
    searchQuery,
    showResults,
    testDocuments,
    form,
    errors,
    isValid,
    query,
    evidences,
    MAX_FILE_SIZE,
    setSearchQuery,
    handleEventSelect,
    handleStepChange,
    handleSubmit,
    handleEdit,
    handleRestore,
    handleOpenDialog,
    handleCloseDialog,
    handleFileUpload,
    handleRemoveFile,
    handleSearch,
    handleClearSelection,
  }
}

