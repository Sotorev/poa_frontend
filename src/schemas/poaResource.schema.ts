// src/schemas/poaResource.schema.ts
import { z } from 'zod';

export const createPoaResourceSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  amount: z.number().positive('El monto debe ser un número positivo'),
  poaId: z.number(),
});

export const updatePoaResourceSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').optional(),
  amount: z.number().positive('El monto debe ser un número positivo').optional(),
});
