// src/schemas/financingSourceSchema.ts
import { z } from 'zod';

// Esquema para crear un nuevo FinancingSource
export const createFinancingSourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

// Esquema para actualizar un FinancingSource existente
export const updateFinancingSourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.enum(['UMES', 'Otra']),
});

export type CreateFinancingSourceInput = z.infer<typeof createFinancingSourceSchema>;
export type UpdateFinancingSourceInput = z.infer<typeof updateFinancingSourceSchema>;
