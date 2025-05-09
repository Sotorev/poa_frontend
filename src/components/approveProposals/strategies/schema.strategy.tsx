import z from 'zod'

export const StrategySchema = z.object({
    description: z.string().min(1, 'Nombre de la estrategia requerido'),
    strategicAreaId: z.number().int().nonnegative().min(1, 'El área estratégica es requerida'),
    completionPercentage: z.number().nonnegative(),
    assignedBudget: z.number().nonnegative(),
    executedBudget: z.number().nonnegative(),
    status: z.enum(['Aprobado', 'Pendiente', 'Rechazado']),
    userId: z.number().int().positive("User ID must be a positive integer").min(1, 'El usuario es requerido'),
    reasonForChange: z.string().max(1000, "Reason for change must be 255 characters or less").min(1, 'La razón para cambiar es requerida'),
});

export const StrategyProposalSchema = StrategySchema.omit({
    userId: true,
    status: true,
    executedBudget: true,
    assignedBudget: true,
    completionPercentage: true,
});

export const StrategyUpdateSchema = StrategySchema.partial();

export const approveStrategySchema = z.object({
    status: z.enum(["Pendiente", "Aprobado", "Rechazado"]),
});



