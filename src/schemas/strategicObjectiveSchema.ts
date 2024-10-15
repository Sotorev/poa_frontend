// schemas/strategicObjectiveSchema.ts
import { z } from 'zod';

export const StrategicObjectiveSchema = z.object({
  strategicObjectiveId: z.number(),
  description: z.string().min(1, "La descripción es requerida"),
  strategicAreaId: z.number(),
  isDeleted: z.boolean(),
});

export type StrategicObjective = z.infer<typeof StrategicObjectiveSchema>;
