import { createEvidenceRequestSchema, restoreEvidenceRequestSchema, updateEvidenceRequestSchema } from "./schema.eventFinished"
import { z } from "zod"


// REQUESTS

export type CreateEvidenceRequest = z.infer<typeof createEvidenceRequestSchema>
export type UpdateEvidenceRequest = z.infer<typeof updateEvidenceRequestSchema>
export type RestoreEvidenceRequest = z.infer<typeof restoreEvidenceRequestSchema>

// RESPONSES

// Get Event Finished Response

export interface EventFinishedResponse {
  eventId: number
  name: string
  dates: EventFinishedDateResponse[]
}

export interface EventFinishedDateResponse {
  eventExecutionDateId: number
  endDate: string
  evidenceFiles: EvidenceFile[]
}

// Create Evidence Response

export interface CreateUpdateEvidenceResponse {
  message: string
  evidenceFiles: EvidenceFile[]
}

export interface EvidenceFile {
  evidenceId: number
  fileName: string
  createdAt: string
}

// Restore Evidence Response
export interface RestoreEvidenceResponse {
  eventId: number
  mensaje: string
}
