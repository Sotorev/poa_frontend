import { eventFinishedRequestSchema } from "./schema.eventFinished"
import { z } from "zod"

// Tipos para las respuestas de la API
export interface EventFinishedDocumentResponse {
  documentId: number
  fileName: string
  fileId: string
  fileUrl: string
  uploadDate: string
}

export interface EventFinishedResponse {
  eventId: number
  name: string
  completionDate: EventFinishedDateResponse[]
  evidenceDocuments: EventFinishedDocumentResponse[]
}

export interface EventFinishedDateResponse {
  eventExecutionDateId: number
  endDate: string
}

// inferir el tipo del scheema
export type EventFinishedRequest = z.infer<typeof eventFinishedRequestSchema>
