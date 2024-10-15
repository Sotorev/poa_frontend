// src/schemas/odsSchema.ts
import { z } from 'zod';

// Esquema para crear un nuevo ODS
export const createOdsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
});

// Esquema para actualizar un ODS existente
export const updateOdsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().nullable(),
  isDeleted: z.boolean(),
});

export type CreateOdsInput = z.infer<typeof createOdsSchema>;
export type UpdateOdsInput = z.infer<typeof updateOdsSchema>;
