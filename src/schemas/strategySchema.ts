// src/schemas/strategySchema.ts
import { z } from 'zod';

export const createStrategySchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  strategicObjectiveId: z.number(),
});

export const updateStrategySchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  strategicObjectiveId: z.number(),
  completionPercentage: z.number().min(0).max(100),
  assignedBudget: z.number().min(0),
  executedBudget: z.number().min(0),
  isDeleted: z.boolean(),
});

export type CreateStrategyInput = z.infer<typeof createStrategySchema>;
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>;
