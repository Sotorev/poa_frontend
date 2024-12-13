import { z } from 'zod';

export const formSchema = z.object({
  eventId: z.string(),
  eventName: z.string(),
  executionResponsible: z.string(),
  campus: z.string(),
  aportesUmes: z.array(z.object({
    tipo: z.string(),
    monto: z.string().transform(v => v.replace(/[^\d.]/g, '')),
  })),
  aportesOtros: z.array(z.object({
    tipo: z.string(),
    monto: z.string().transform(v => v.replace(/[^\d.]/g, '')),
  })),
  archivosGastos: z.array(z.any()),
  fechas: z.array(z.object({
    fecha: z.string(),
  })),
});

export type FormValues = z.infer<typeof formSchema>;

