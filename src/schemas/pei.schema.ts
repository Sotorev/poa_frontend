import { z } from 'zod';

const interventionSchema = z.object({
	interventionId: z.number().int().positive().optional(),
	name: z.string().min(1, 'Description is required'),
	isDeleted: z.boolean().optional(),
	status: z.enum(['Aprobado', 'Pendiente', 'Rechazado']).optional(),
	userId: z.number().int().positive("User ID must be a positive integer").optional(),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
	reasonForChange: z.string().max(1000, "Reason for change must be 255 characters or less").optional(),
});

const strategySchema = z.object({
	strategyId: z.number().int().positive().optional(),
	strategicAreaId: z.number().int().positive().optional(),
	description: z.string().min(1, 'Description is required'),
	completionPercentage: z.number().min(0).max(100).optional(),
	assignedBudget: z.number().min(0).optional(),
	executedBudget: z.number().min(0).optional(),
	interventions: z.array(interventionSchema).optional(),
	isDeleted: z.boolean().optional(),
	status: z.enum(['Aprobado', 'Pendiente', 'Rechazado']).optional(),
	userId: z.number().int().positive("User ID must be a positive integer").optional(),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
	reasonForChange: z.string().max(1000, "Reason for change must be 255 characters or less").optional(),
});


const strategicAreaSchema = z.object({
	strategicAreaId: z.number().int().positive().optional(),
	name: z.string().min(1, 'Name is required'),
	strategies: z.array(strategySchema).optional(),
	strategicObjective: z.string().min(1, 'Strategic objective is required'),
	isDeleted: z.boolean().optional(),
	status: z.enum(['Aprobado', 'Pendiente', 'Rechazado']).optional(),
	userId: z.number().int().positive("User ID must be a positive integer").optional(),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
	reasonForChange: z.string().max(1000, "Reason for change must be 255 characters or less").optional(),
});

export const createPeiSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	status: z.enum(['Activo', 'Inactivo']),
	strategicAreas: z.array(strategicAreaSchema),
	startYear: z.number().int().positive(),
	endYear: z.number().int().positive(),
	isDeleted: z.boolean().optional(),
});

export const updatePeiSchema = z.object({
	name: z.string().min(1).optional(),
	status: z.enum(['Activo', 'Inactivo']),
	strategicAreas: z.array(strategicAreaSchema).optional(),
	startYear: z.number().int().positive().optional(),
	endYear: z.number().int().positive(),
	isDeleted: z.boolean().optional(),
});

export type Intervention = z.infer<typeof interventionSchema>;
export type Strategy = z.infer<typeof strategySchema>;
export type StrategicArea = z.infer<typeof strategicAreaSchema>;
export type PeiCreate = z.infer<typeof createPeiSchema>;
export type PeiUpdate = z.infer<typeof updatePeiSchema>; 