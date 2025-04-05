// src/schemas/poa-event-tracking-schema.ts

import { z } from "zod";

const aporteSchema = z.object({
  eventExecutionFinancingId: z.number().optional(),
  eventId: z.number().optional(),
  financingSourceId: z.coerce.number().min(1, "Seleccione una fuente de financiamiento"),
  amount: z.coerce.number().nonnegative("El monto debe ser un valor positivo"),
  percentage: z.coerce.number().optional(),
});

const fechaSchema = z.object({
  eventDateId: z.number().optional(),
  startDate: z.string().trim().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().optional(),
  executionStartDate: z.string().optional(),
  executionEndDate: z.any().optional(),
  reasonForChange: z.string().nullable().optional(),
  statusId: z.number().optional(),
  isEnabled: z.boolean().optional(),
});

export const formSchema = z.object({
  eventId: z.string().trim().min(1, "El ID del evento es requerido"),
  eventName: z.string().trim().min(1, "El nombre del evento es requerido"),
  executionResponsible: z.string().trim().min(1, "El responsable de ejecución es requerido"),
  campus: z.string().trim().min(1, "El campus es requerido"),
  aportesUmes: z.array(aporteSchema).nonempty("Debe haber al menos un aporte UMES"),
  aportesOtros: z.array(aporteSchema).nonempty("Debe haber al menos un aporte de otras fuentes"),
  archivosGastos: z.array(z.any()),
  fechas: z.array(fechaSchema).nonempty("Debe haber al menos una fecha de ejecución"),
});
