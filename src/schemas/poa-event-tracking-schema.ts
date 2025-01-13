// src/schemas/poa-event-tracking-schema.ts

import { z } from 'zod';
import { FormValues } from '@/types/eventExecution.type';

export const formSchema = z.object({
  eventId: z.string().nonempty("El ID del evento es requerido"),
  eventName: z.string().nonempty("El nombre del evento es requerido"),
  executionResponsible: z.string().nonempty("El responsable de ejecución es requerido"),
  campus: z.string().nonempty("El campus es requerido"),
  aportesUmes: z.array(z.object({
    eventId: z.number().optional(),
    financingSourceId: z.coerce.number().min(1, "Seleccione una fuente de financiamiento"),
    amount: z.coerce.number().min(0, "El monto debe ser un valor positivo"),
    percentage: z.coerce.number().optional(),
  })).nonempty("Debe haber al menos un aporte UMES"),
  aportesOtros: z.array(z.object({
    eventId: z.number().optional(),
    financingSourceId: z.coerce.number().min(1, "Seleccione una fuente de financiamiento"),
    amount: z.coerce.number().min(0, "El monto debe ser un valor positivo"),
    percentage: z.coerce.number().optional(),
  })).optional(),
  archivosGastos: z.array(z.any()),
  fechas: z.array(z.object({
    fecha: z.string().nonempty("La fecha es requerida"),
  })).nonempty("Debe haber al menos una fecha de ejecución"),
});