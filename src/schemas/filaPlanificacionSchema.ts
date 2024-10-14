// src/schemas/filaPlanificacionSchema.ts
import { z } from 'zod';

// Define el esquema para DatePair
const datePairSchema = z.object({
  start: z.date(),
  end: z.date(),
});

// Define el esquema de planificación de fila
export const filaPlanificacionSchema = z.object({
  id: z.string(),
  areaEstrategica: z.string().nonempty("Área Estratégica es requerida"),
  objetivoEstrategico: z.string().nonempty("Objetivo Estratégico es requerido"),
  estrategias: z.array(z.string().nonempty("La estrategia no puede estar vacía")),
  intervencion: z.array(z.string().nonempty("La intervención no puede estar vacía")),
  ods: z.array(z.string()),
  tipoEvento: z.enum(['actividad', 'proyecto']),
  evento: z.string().nonempty("El nombre del evento es requerido"),
  objetivo: z.string().nonempty("El objetivo es requerido"),
  costoTotal: z.number().nonnegative("El costo total no puede ser negativo"),
  aporteUMES: z.array(z.object({
    financingSourceId: z.number(),
    porcentaje: z.number().min(0).max(100),
    amount: z.number().nonnegative(),
  })),
  aporteOtros: z.array(z.object({
    financingSourceId: z.number(),
    porcentaje: z.number().min(0).max(100),
    amount: z.number().nonnegative(),
  })),
  tipoCompra: z.array(z.string()),
  detalle: z.any().nullable(),
  responsablePlanificacion: z.string().nonempty("Responsable de planificación es requerido"),
  responsableEjecucion: z.string().nonempty("Responsable de ejecución es requerido"),
  responsableSeguimiento: z.string().nonempty("Responsable de seguimiento es requerido"),
  recursos: z.array(z.string()),
  indicadorLogro: z.string().nonempty("El indicador de logro es requerido"),
  detalleProceso: z.any().nullable(),
  fechas: z.array(datePairSchema).nonempty("Debe haber al menos una fecha."),
}).refine((data) => {
  // Validación personalizada: proyectos deben tener exactamente una fecha
  if (data.tipoEvento === "proyecto") {
    return data.fechas.length === 1;
  }
  return true;
}, {
  message: "Los proyectos deben tener exactamente una fecha.",
  path: ["fechas"],
});
