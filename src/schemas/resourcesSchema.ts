// src/schemas/resourcesSchema.ts
import { z } from 'zod';

// Esquema para crear un nuevo recurso
export const createResourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

// Esquema para actualizar un recurso existente
export const updateResourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
