"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

import type { EventFinished, EventFinishedFormData } from "@/components/poa/finalizacion/type.eventFinished"
import { ResponseExecutedEvent } from "@/types/eventExecution.type"

import { eventFinishedSchema } from "@/components/poa/finalizacion/schema.eventFinished"

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
  const [finishedEvents, setFinishedEvents] = useState<EventFinished[]>([])
  const [availableEvents, setAvailableEvents] = useState<ResponseExecutedEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ResponseExecutedEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<EventFinished | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEvents, setFilteredEvents] = useState<ResponseExecutedEvent[]>([])
  const [showResults, setShowResults] = useState(false)
  const [testDocuments, setTestDocuments] = useState<File[]>([])

  const { toast } = useToast()
  const user = useCurrentUser()

  // Configuración del formulario
  const form = useForm<EventFinishedFormData>({
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

  const loadData = async () => {
    if (!user?.token) return

    setIsLoading(true)
    try {

      const facultyId = await getFacultyByUserId(user.userId, user.token)
      const poaId = (await getPoaByFacultyAndYear(facultyId, 2025,user.token)).poaId
      const [/*finishedEventsData, */availableEventsData] = await Promise.all([
       // getFinishedEvents(user.token),
        getAvailableEventsToFinish(user.token, poaId),
      ])

     // setFinishedEvents(finishedEventsData)
      setAvailableEvents(availableEventsData)

      console.log("availableEvents", availableEvents)
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

  // Cargar datos


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

  // Manejar selección de evento
  const handleEventSelect = (event: ResponseExecutedEvent) => {
    setSelectedEvent(event)
    form.setValue("eventId", event.eventId.toString())
    form.setValue("eventName", event.name)
    setShowResults(false)
  }

  // Manejar cambio de paso
  const handleStepChange = async (step: number) => {
    if (step === currentStep) return

    if (step > currentStep) {
      // Validar paso actual antes de avanzar
      let isStepValid = false

      if (currentStep === 1) {
        isStepValid = await form.trigger(["eventId", "eventName"])
      } else if (currentStep === 2) {
        isStepValid = await form.trigger(["completionDate", "testDocuments"])
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
  const handleSubmit = async (data: EventFinishedFormData) => {
    if (!user?.token) return

    setIsLoading(true)
    try {
      const requestData = {
        eventId: Number.parseInt(data.eventId),
        completionDate: data.completionDate,
        testDocuments: data.testDocuments,
      }

      if (editingEvent) {
        await updateFinishedEvent(editingEvent.eventId, requestData, user.token)
        toast({
          title: "Éxito",
          description: "Evento actualizado correctamente",
        })
      } else {
        await markEventAsFinished(requestData, user.token)
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
  const handleEdit = (event: EventFinished) => {
    setEditingEvent(event)

    // Buscar el evento en la lista de disponibles para obtener detalles completos
    const fullEvent = availableEvents.find((e) => e.eventId === event.eventId) || null
    setSelectedEvent(fullEvent)

    // Establecer valores del formulario
    form.setValue("eventId", event.eventId.toString())
    form.setValue("eventName", event.name)
    form.setValue("completionDate", event.completionDate)

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
      eventId: "",
      eventName: "",
      completionDate: new Date().toISOString().split("T")[0],
      testDocuments: [],
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

  // Manejar carga de documentos
  const handleFileUpload = (files: File[]) => {
    setTestDocuments((prev) => [...prev, ...files])
    form.setValue("testDocuments", [...testDocuments, ...files])
  }

  // Manejar eliminación de documento
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...testDocuments]
    updatedFiles.splice(index, 1)
    setTestDocuments(updatedFiles)
    form.setValue("testDocuments", updatedFiles)
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
    setSearchQuery,
    handleEventSelect,
    handleStepChange,
    handleSubmit: form.handleSubmit(handleSubmit),
    handleEdit,
    handleRestore,
    handleOpenDialog,
    handleCloseDialog,
    handleFileUpload,
    handleRemoveFile,
  }
}

