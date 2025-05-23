// src/components/poa/eventManagement/formView/eventPlanningForm.schema.ts
import { z } from "zod";

// Esquema para actualizar las fechas en formato ISO (YYYY-MM-DD)
const dateSchema = z.object({
  eventDateId: z.number().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha de inicio debe ser una fecha válida en formato ISO",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha de fin debe ser una fecha válida en formato ISO",
  }),
  isDeleted: z.boolean().optional(),
});

export type DateSchema = z.infer<typeof dateSchema>;

const financingSchema = z.object({
  eventFinancingId: z.number({
    required_error: "El ID del financiamiento del evento es requerido",
    invalid_type_error: "El ID del financiamiento del evento debe ser un número",
  }).optional(),
  financingSourceId: z.number({
    required_error: "La fuente de financiamiento es requerida",
    invalid_type_error: "La fuente de financiamiento debe ser un número",
  }),
  percentage: z
    .number({
      required_error: "El porcentaje es requerido",
      invalid_type_error: "El porcentaje debe ser un número",
    })
    .min(0, "El porcentaje no puede ser menor que 0")
    .max(100, "El porcentaje no puede ser mayor que 100"),
  amount: z
    .number({
      required_error: "El monto es requerido",
      invalid_type_error: "El monto debe ser un número",
    })
    .nonnegative("El monto no puede ser negativo"),
  isDeleted: z.boolean().optional(),
});

export type FinancingSourceRequest = z.infer<typeof financingSchema>;

const responsibleSchema = z.object({
  eventResponsibleId: z.number({
    required_error: "El ID del responsable del evento es requerido",
    invalid_type_error: "El ID del responsable del evento debe ser un número",
  }).optional(),
  responsibleRole: z.enum(["Principal", "Ejecución", "Seguimiento"], {
    required_error: "El rol del responsable es requerido",
    invalid_type_error:
      "El rol del responsable debe ser Principal, Ejecución o Seguimiento",
  }),
  name: z
    .string({
      required_error: "El nombre es requerido",
      invalid_type_error: "El nombre debe ser texto",
    })
    .min(1, "El nombre es requerido"),
});

export type Responsible = z.infer<typeof responsibleSchema>;

// Esquema para recursos
const resourceSchema = z.object({
  resourceId: z.number({
    required_error: "Debe seleccionarse almenos un recurso",
    invalid_type_error: "El ID del recurso debe ser un número",
  }),
});

// Schema completo para la request de fullevent
export const fullEventSchema = z
  .object({
    name: z
      .string({
        required_error: "El nombre del evento es requerido",
        invalid_type_error: "El nombre debe ser texto",
      })
      .min(1, "El nombre del evento es requerido")
      .trim(),

    type: z.enum(["Actividad", "Proyecto"], {
      required_error: "El tipo es requerido",
      invalid_type_error: "El tipo debe ser Actividad o Proyecto",
    }),

    poaId: z.number({
      required_error: "El ID del POA es requerido",
      invalid_type_error: "El ID del POA debe ser un número",
    }),

    statusId: z.number({
      required_error: "El estado es requerido",
      invalid_type_error: "El estado debe ser un número",
    }),

    completionPercentage: z
      .number({
        required_error: "El porcentaje de cumplimiento es requerido",
        invalid_type_error: "El porcentaje de cumplimiento debe ser un número",
      })
      .min(0, "El porcentaje de cumplimiento no puede ser negativo")
      .max(100, "El porcentaje de cumplimiento no puede superar 100"),

    campusId: z.number({
      required_error: "El campus es requerido",
      invalid_type_error: "El campus debe ser un número",
    }),

    objective: z
      .string({
        required_error: "El objetivo es requerido",
        invalid_type_error: "El objetivo debe ser texto",
      })
      .min(1, "El objetivo es requerido")
      .trim(),

    eventNature: z
      .enum(["Planificado", "Extraordinario"], {
        required_error: "La naturaleza del evento es requerida",
        invalid_type_error: "La naturaleza del evento debe ser Planificado o Extraordinario",
      }),

    isDelayed: z.boolean(),

    achievementIndicator: z
      .string({
        required_error: "El indicador de logro es requerido",
        invalid_type_error: "El indicador de logro debe ser texto",
      })
      .min(1, "El indicador de logro es requerido")
      .trim(),

    purchaseTypeId: z.number({
      required_error: "El tipo de compra es requerido",
      invalid_type_error: "El tipo de compra debe ser un número",
    }),

    totalCost: z
      .number({
        required_error: "El costo total es requerido",
        invalid_type_error: "El costo total debe ser un número",
      })
      .min(1, "El costo total debe ser mayor que cero"),

    dates: z
      .array(dateSchema, {
        required_error: "Las fechas son requeridas",
        invalid_type_error: "Las fechas deben ser un arreglo",
      })
      .min(1, "Debe haber al menos una fecha"),

    financings: z
      .array(financingSchema, {
        required_error: "Los financiamientos son requeridos",
        invalid_type_error: "Los financiamientos deben ser un arreglo",
      })
      .min(1, "Debe tener al menos un financiamiento"),

    approvals: z.array(z.any()).optional(),

    responsibles: z
      .array(responsibleSchema, {
        required_error: "Los responsables son requeridos",
        invalid_type_error: "Los responsables deben ser un arreglo",
      })
      .min(1, "Debe asignar al menos un responsable"),

    interventions: z
      .array(z.object({ intervention: z.number() }), {
        required_error: "Las intervenciones son requeridas",
        invalid_type_error: "Las intervenciones deben ser un arreglo",
      })
      .min(1, "Debe seleccionar al menos una intervención"),

    ods: z
      .array(z.object({ ods: z.number() }), {
        required_error: "Los ODS son requeridos",
        invalid_type_error: "Los ODS deben ser un arreglo",
      })
      .min(1, "Debe seleccionar al menos un ODS"),

    resources: z
      .array(resourceSchema, {
        required_error: "Los recursos son requeridos",
        invalid_type_error: "Los recursos deben ser un arreglo",
      })
      .min(1, "Debe asignar al menos un recurso"),

    userId: z.number({
      required_error: "El ID del usuario es requerido",
      invalid_type_error: "El ID del usuario debe ser un número",
    }),

    costDetailDocuments: z.array(
      z.object({
        costDetailId: z.number().optional(), 
        file: z.instanceof(File).optional(),
        name: z.string().optional(),
        isDeleted: z.boolean().optional(),
      })
    ).nullable(),
    processDocuments: z.array(
      z.object({
        fileId: z.number().optional(),
        file: z.instanceof(File).optional(),
        name: z.string().optional(),
        isDeleted: z.boolean().optional(),
      })
    ).nullable(),
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

// Esquema para actualización de eventos
export const updatefullEventSchema = z.object({
  eventId: z.number(),
  data: fullEventSchema,
});

export type UpdateEventRequest = z.infer<typeof updatefullEventSchema>;

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
