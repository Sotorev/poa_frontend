// src/components/poa/eventManagement/formView/eventPlanningForm.schema.ts
import { z } from "zod";

// Esquema para las fechas en formato ISO (YYYY-MM-DD)
const dateSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "startDate debe ser una fecha válida en formato ISO",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "endDate debe ser una fecha válida en formato ISO",
  }),
});

export type DateSchema = z.infer<typeof dateSchema>;

// Esquema para financiamientos
const financingSchema = z.object({
  financingSourceId: z.number(),
  percentage: z
    .number()
    .min(0, "El porcentaje no puede ser menor que 0")
    .max(100, "El porcentaje no puede ser mayor que 100"),
  amount: z.number().nonnegative("El monto no puede ser negativo"),
});

// Esquema para responsables
const responsibleSchema = z.object({
  responsibleRole: z.enum(["Principal", "Ejecución", "Seguimiento"]),
  name: z.string().min(1, "El nombre es requerido"),
});

export type Responsible = z.infer<typeof responsibleSchema>;

// Esquema para recursos
const resourceSchema = z.object({
  resourceId: z.number(),
});

// Schema completo para la request de fullevent
export const fullEventSchema = z
  .object({
    name: z.string().min(1, "El nombre del evento es requerido"),
    type: z.enum(["Actividad", "Proyecto"]),
    poaId: z.number(),
    statusId: z.number(),
    completionPercentage: z
      .number()
      .min(0, "El porcentaje de cumplimiento no puede ser negativo")
      .max(100, "El porcentaje de cumplimiento no puede superar 100"),
    campusId: z.number(),
    objective: z.string().min(1, "El objetivo es requerido"),
    eventNature: z.string().min(1, "La naturaleza del evento es requerida"),
    isDelayed: z.boolean(),
    achievementIndicator: z
      .string()
      .min(1, "El indicador de logro es requerido"),
    purchaseTypeId: z.number(),
    totalCost: z.number().min(1, "El costo total debe ser mayor que cero"),
    dates: z.array(dateSchema).min(1, "Debe haber al menos una fecha"),
    financings: z
      .array(financingSchema)
      .min(1, "Debe tener al menos un financiamiento"),
    approvals: z.array(z.any()),
    responsibles: z
      .array(responsibleSchema)
      .min(1, "Debe asignar al menos un responsable"),
    interventions: z.array(z.object({ intervention: z.number() })),
    ods: z.array(z.object({ ods: z.number() })),
    resources: z
      .array(resourceSchema)
      .min(1, "Debe asignar al menos un recurso"),
    userId: z.number(),
    costDetailDocuments: z.array(z.instanceof(File)).nullable(),
    processDocuments: z.array(z.instanceof(File)).nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "Proyecto") {
        return data.dates.length === 1;
      }
      return true;
    },
    {
      message: "Los proyectos deben tener exactamente una fecha.",
      path: ["dates"],
    }
  );

export type FullEventRequest = z.infer<typeof fullEventSchema>;

// Define el esquema para DatePair
const datePairSchema = z.object({
  start: z.date(),
  end: z.date(),
});

// Define el esquema de planificación de fila
export const filaPlanificacionSchema = z
  .object({
    id: z.string(),
    areaEstrategica: z.string().min(1, "Área Estratégica es requerida"),
    objetivoEstrategico: z.string().min(1, "Objetivo Estratégico es requerido"),
    estrategias: z
      .array(z.string().min(1, "La estrategia no puede estar vacía"))
      .min(1, "Debe seleccionar al menos una estrategia"),
    intervencion: z
      .array(z.string().min(1, "La intervención no puede estar vacía"))
      .min(1, "Debe seleccionar al menos una intervención"),
    ods: z.array(z.string()).min(1, "Debe seleccionar al menos un ODS"),
    tipoEvento: z.enum(["actividad", "proyecto"]),
    evento: z.string().min(1, "El nombre del evento es requerido"),
    objetivo: z.string().min(1, "El objetivo es requerido"),
    costoTotal: z.number().min(1, "El costo total debe ser mayor que cero"),
    aporteUMES: z
      .array(
        z.object({
          financingSourceId: z.number(),
          percentage: z.number().min(0).max(100),
          amount: z.number().nonnegative(),
        })
      )
      .min(1, "Debe tener al menos un aporte UMES"),
    aporteOtros: z
      .array(
        z.object({
          financingSourceId: z.number(),
          percentage: z.number().min(0).max(100),
          amount: z.number().nonnegative(),
        })
      )
      .min(1, "Debe tener al menos un aporte de otras fuentes"),
    tipoCompra: z.string().min(1, "Tipo de Compra es requerido"), // Cambiado a arreglo
    costDetailDocuments: z.any().array().nullable(),
    responsablePlanificacion: z
      .string()
      .min(1, "Responsable de planificación es requerido"),
    responsableEjecucion: z
      .string()
      .nonempty("Responsable de ejecución es requerido"),
    responsableSeguimiento: z
      .string()
      .min(1, "Responsable de seguimiento es requerido"),
    recursos: z
      .array(z.string())
      .min(1, "Debe seleccionar al menos un recurso"),
    indicadorLogro: z.string().min(1, "El indicador de logro es requerido"),
    processDocuments: z.any().array().nullable(),
    fechas: z.array(datePairSchema).min(1, "Debe haber al menos una fecha."),
    campusId: z.string().min(1, "Campus es requerido"), // Añadido para CampusSelector
  })
  .refine(
    (data) => {
      // Validación personalizada: proyectos deben tener exactamente una fecha
      if (data.tipoEvento === "proyecto") {
        return data.fechas.length === 1;
      }
      return true;
    },
    {
      message: "Los proyectos deben tener exactamente una fecha.",
      path: ["fechas"],
    }
  );

export type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>;
