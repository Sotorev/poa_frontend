import * as z from "zod"

// Esquema para validar el formulario de evento finalizado
export const eventFinishedSchema = z.object({
  eventId: z.string().min(1, {
    message: "Debe seleccionar un evento",
  }),
  eventName: z.string().min(1, {
    message: "El nombre del evento es requerido",
  }),
  completionDate: z.string().min(1, {
    message: "La fecha de finalización es requerida",
  }),
  testDocuments: z.array(z.instanceof(File)).min(1, {
    message: "Debe adjuntar al menos un documento de prueba",
  }),
})

// Esquema para validar el paso 1 (selección de evento)
export const eventSelectionSchema = z.object({
  eventId: z.string().min(1, {
    message: "Debe seleccionar un evento",
  }),
  eventName: z.string().min(1, {
    message: "El nombre del evento es requerido",
  }),
})

// Esquema para validar el paso 2 (datos de finalización)
export const completionDataSchema = z.object({
  completionDate: z.string().min(1, {
    message: "La fecha de finalización es requerida",
  }),
  testDocuments: z.array(z.instanceof(File)).min(1, {
    message: "Debe adjuntar al menos un documento de prueba",
  }),
})

