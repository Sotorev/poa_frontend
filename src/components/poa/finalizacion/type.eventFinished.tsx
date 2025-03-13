import type { z } from "zod"
import type { eventFinishedSchema } from "@/components/poa/finalizacion/schema.eventFinished"
import { ResponseExecutedEvent } from "@/types/eventExecution.type"

// Tipos básicos
export interface EventFinished {
  eventId: number
  name: string
  completionDate: string
  testDocuments: EventFinishedDocument[]
  campus?: string
  objective?: string
  responsibles?: EventResponsible[]
  totalCost?: number
}

export interface EventResponsible {
  responsibleId: number
  name: string
  responsibleRole: string
}

export interface EventFinishedDocument {
  documentId: number
  fileName: string
  fileId: string
  fileUrl: string
  uploadDate: string
}

// Tipos para la tabla
export interface EventFinishedTableProps {
  events: EventFinished[]
  onEdit: (event: EventFinished) => void
  onRestore: (eventId: number) => void
  onView: (event: EventFinished) => void
}

// Tipos para el formulario
export interface EventFinishedFormProps {
  onSubmit: (data: EventFinishedFormData) => void
  selectedEvent: ResponseExecutedEvent | null
  isLoading?: boolean
  currentStep: number
  onStepChange: (step: number) => void
  onEventSelect: (event: ResponseExecutedEvent) => void
  availableEvents: ResponseExecutedEvent[]
}

// Tipos para el formulario de datos
export type EventFinishedFormData = z.infer<typeof eventFinishedSchema>

// Tipos para la vista principal
export interface EventFinishedViewProps {
  events: EventFinished[]
  availableEvents: ResponseExecutedEvent[]
}

// Tipos para las respuestas de la API
export interface EventFinishedResponse {
  eventId: number
  name: string
  completionDate: string
  testDocuments: EventFinishedDocument[]
  campus: string
  objective: string
  responsibles: EventResponsible[]
  totalCost: number
}

// Tipos para las solicitudes a la API
export interface EventFinishedRequest {
  eventId: number
  completionDate: string
  testDocuments: File[]
}

