import { z } from "zod"

// Schema para CreateEvidenceRequest
export const createEvidenceRequestSchema = z.object({
  data: z.object({
    eventId: z.number({
      required_error: "Debe seleccionar un evento",
      invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error eventId CreateEvidenceRequest)"
    }),
    eventDateId: z.number({
      required_error: "Debe seleccionar una fecha de ejecución del evento",
      invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error eventDateId CreateEvidenceRequest)"
    }),
    endDate: z.string({
      required_error: "Por favor ingrese la fecha de finalización del evento",
      invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error endDate CreateEvidenceRequest)"
    })
  }),
  evidence: z.array(z.instanceof(File, {
    message: "Cada elemento en evidence debe ser un archivo"
  }), {
    required_error: "Debe subir al menos un archivo de evidencia",
    invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error evidence CreateEvidenceRequest)"
  })
});

// Schema para UpdateEvidenceRequest
export const updateEvidenceRequestSchema = z.object({
  data: z.object({
    eventId: z.number({
      required_error: "Debe seleccionar un evento",
      invalid_type_error: "Debe seleccionar un evento"
    }),
    eventDateId: z.number({
      required_error: "Debe seleccionar una fecha de ejecución del evento",
      invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error eventDateId UpdateEvidenceRequest)"
    }),
    endDate: z.string({
      required_error: "Por favor ingrese la fecha de finalización del evento",
      invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error endDate UpdateEvidenceRequest)"
    })
  }),
  evidence: z.array(z.instanceof(File, {
    message: "Cada elemento en evidence debe ser un archivo"
  }), {
    required_error: "Debe subir al menos un archivo de evidencia",
    invalid_type_error: "A ocurrido un error por favor intente nuevamente y si el problema persiste contacte al administrador (invalid_type_error evidence UpdateEvidenceRequest)"
  })
});

// Schema para RestoreEvidenceRequest
export const restoreEvidenceRequestSchema = z.object({
  eventId: z.number({
    required_error: "A ocurrido un error por favor recargue la pagina y si el problema persiste contacte al administrador (required_error eventId RestoreEvidenceRequest)",
    invalid_type_error: "A ocurrido un error por favor recargue la pagina y si el problema persiste contacte al administrador (invalid_type_error eventId RestoreEvidenceRequest)"
  })
});
