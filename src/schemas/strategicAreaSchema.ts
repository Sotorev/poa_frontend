
// src/schemas/strategicAreaSchema.ts
import { z } from 'zod';

export const strategicAreaSchema = z.object({
  strategicAreaId: z.number(),
  name: z.string(),
  peiId: z.number(),
  isDeleted: z.boolean(),
});

export const strategicAreasSchema = z.array(strategicAreaSchema);
