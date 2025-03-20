import { z } from "zod"

export const eventFinishedDateRequestSchema = z.object({
  eventExecutionDateId: z.number(),
  endDate: z.string(),
})

// Esquema para validar el formulario de evento finalizado
export const eventFinishedRequestSchema = z.object({
  eventId: z.number().min(1, {
    message: "Debe seleccionar un evento",
  }),
  endDate: z.array(eventFinishedDateRequestSchema).min(1, {
    message: "Debe especificar al menos una fecha de finalización",
  }),
  evidences: z.array(z.instanceof(File)).min(1, {
    message: "Debe adjuntar al menos un documento de prueba",
  }),
})

// Esquema para validar el paso 1 (selección de evento)
export const eventSelectionSchema = z.object({
  eventId: z.number().min(1, {
    message: "Debe seleccionar un evento",
  })
})

// Esquema para validar el paso 2 (datos de finalización)
export const completionDataSchema = z.object({
  completionDate: z.array(eventFinishedDateRequestSchema),
  testDocuments: z.array(z.instanceof(File)).min(1, {
    message: "Debe adjuntar al menos un documento de prueba",
  }),
})

