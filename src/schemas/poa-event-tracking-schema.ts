// src/schemas/poa-event-tracking-schema.ts

import { z } from 'zod';
import { FormValues } from '@/types/eventExecution.type';

const aporteSchema = z.object({
  eventExecutionFinancingId: z.number().optional(),
  eventId: z.number().optional(),
  financingSourceId: z.coerce.number().min(1, "Seleccione una fuente de financiamiento"),
  amount: z.coerce.number().min(0, "El monto debe ser un valor positivo"),
  percentage: z.coerce.number().optional(),
});

const fechaSchema = z.object({
  eventExecutionDateId: z.number().optional(),
  startDate: z.string().nonempty("La fecha de inicio es requerida"),
  endDate: z.string().nonempty("La fecha de fin es requerida"),
  reasonForChange: z.string().nullable().optional(),
  isDeleted: z.boolean().optional(),
});

export const formSchema = z.object({
  eventId: z.string().nonempty("El ID del evento es requerido"),
  eventName: z.string().nonempty("El nombre del evento es requerido"),
  executionResponsible: z.string().nonempty("El responsable de ejecución es requerido"),
  campus: z.string().nonempty("El campus es requerido"),
  aportesUmes: z.array(aporteSchema).nonempty("Debe haber al menos un aporte UMES"),
  aportesOtros: z.array(aporteSchema).optional(),
  archivosGastos: z.array(z.any()),
  fechas: z.array(fechaSchema).nonempty("Debe haber al menos una fecha de ejecución"),
});