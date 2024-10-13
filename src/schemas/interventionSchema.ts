// src/schemas/interventionSchema.ts
import { z } from 'zod';

// Esquema para crear una nueva intervención
export const createInterventionSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  strategyId: z.number().int("strategyId debe ser un número entero"),
});

// Esquema para actualizar una intervención existente
export const updateInterventionSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  strategyId: z.number().int("strategyId debe ser un número entero"),
  isDeleted: z.boolean(),
});

export type CreateInterventionInput = z.infer<typeof createInterventionSchema>;
export type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>;
