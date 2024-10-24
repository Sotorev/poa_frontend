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
  estrategias: z.array(z.string().nonempty("La estrategia no puede estar vacía")).min(1, "Debe seleccionar al menos una estrategia"),
  intervencion: z.array(z.string().nonempty("La intervención no puede estar vacía")).min(1, "Debe seleccionar al menos una intervención"),
  ods: z.array(z.string()).min(1, "Debe seleccionar al menos un ODS"),
  tipoEvento: z.enum(['actividad', 'proyecto']),
  evento: z.string().nonempty("El nombre del evento es requerido"),
  objetivo: z.string().nonempty("El objetivo es requerido"),
  costoTotal: z.number().min(1, "El costo total debe ser mayor que cero"),
  aporteUMES: z.array(z.object({
    financingSourceId: z.number(),
    porcentaje: z.number().min(0).max(100),
    amount: z.number().nonnegative(),
  })).min(1, "Debe tener al menos un aporte UMES"),
  aporteOtros: z.array(z.object({
    financingSourceId: z.number(),
    porcentaje: z.number().min(0).max(100),
    amount: z.number().nonnegative(),
  })).min(1, "Debe tener al menos un aporte de otras fuentes"),
  tipoCompra: z.string().nonempty("Tipo de Compra es requerido"),// Cambiado a arreglo
  detalle: z.any().nullable(),
  responsablePlanificacion: z.string().nonempty("Responsable de planificación es requerido"),
  responsableEjecucion: z.string().nonempty("Responsable de ejecución es requerido"),
  responsableSeguimiento: z.string().nonempty("Responsable de seguimiento es requerido"),
  recursos: z.array(z.string()).min(1, "Debe seleccionar al menos un recurso"),
  indicadorLogro: z.string().nonempty("El indicador de logro es requerido"),
  detalleProceso: z.any().nullable(),
  fechas: z.array(datePairSchema).nonempty("Debe haber al menos una fecha."),
  campusId: z.string().nonempty("Campus es requerido"), // Añadido para CampusSelector
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
