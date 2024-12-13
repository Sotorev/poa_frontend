// src/schemas/poa-event-tracking-schema.ts

import { z } from 'zod';

export const formSchema = z.object({
  eventId: z.string().nonempty("El ID del evento es requerido"),
  eventName: z.string().nonempty("El nombre del evento es requerido"),
  executionResponsible: z.string().nonempty("El responsable de ejecución es requerido"),
  campus: z.string().nonempty("El campus es requerido"),
  aportesUmes: z.array(z.object({
    tipo: z.string().nonempty("El tipo de aporte es requerido"),
    monto: z.string().nonempty("El monto es requerido").transform(v => v.replace(/[^\d.]/g, '')),
  })).nonempty("Debe haber al menos un aporte UMES"),
  aportesOtros: z.array(z.object({
    tipo: z.string().nonempty("El tipo de aporte es requerido"),
    monto: z.string().nonempty("El monto es requerido").transform(v => v.replace(/[^\d.]/g, '')),
  })),
  archivosGastos: z.array(z.any()),
  fechas: z.array(z.object({
    fecha: z.string().nonempty("La fecha es requerida"),
  })).nonempty("Debe haber al menos una fecha de ejecución"),
});

export type FormValues = z.infer<typeof formSchema>;